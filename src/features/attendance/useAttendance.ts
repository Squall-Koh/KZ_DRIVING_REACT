import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── 타입 ────────────────────────────────────────────────────
export interface DayRecord {
  date: string;        // "2026-03-01"  (ISO, 정렬·비교용)
  dateLabel: string;   // "26.03.01 (토)"
  checkIn: string;     // "07:30"
  checkOut: string;    // "17:30"
  regularH: number;
  overtimeH: number;
  nightH: number;
}

export interface WeekRecord {
  weekLabel: string;
  dateFrom: string;
  dateTo: string;
  regularH: number;
  overtimeH: number;
  nightH: number;
  days: DayRecord[];
}

export interface FlutterBridgeData {
  userName: string;
  isVehicleConnected: boolean;
  plateNumber: string;
  vehicleName: string;
  connectionStatus: string;
  checkIn: string;
  checkOut: string;
}

export interface AttendanceStats {
  totalH: number;
  regular: number;
  overtime: number;
  night: number;
}

export interface WorkProgress {
  pct: number;
  label: string;
}

// ─── 연월 선택지 ──────────────────────────────────────────────
function generateMonthOptions(): string[] {
  const opts: string[] = [];
  const base = new Date(2026, 2);
  for (let i = 0; i < 12; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i);
    opts.push(`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return opts;
}

export const MONTH_OPTIONS = generateMonthOptions();

// ─── 달력 주간 계산 ───────────────────────────────────────────
export function generateWeeks(yearMonth: string): { weekLabel: string; dateFrom: string; dateTo: string }[] {
  const [y, m] = yearMonth.split('.').map(Number);
  const fmt = (d: Date) =>
    `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const DAY = ['일', '월', '화', '수', '목', '금', '토'];

  const firstDay = new Date(y, m - 1, 1);
  const startSun = new Date(firstDay);
  startSun.setDate(firstDay.getDate() - firstDay.getDay());
  const lastDay = new Date(y, m, 0);

  const weeks: { weekLabel: string; dateFrom: string; dateTo: string }[] = [];
  const cur = new Date(startSun);

  while (cur <= lastDay) {
    const from = new Date(cur);
    const to   = new Date(cur);
    to.setDate(to.getDate() + 6);
    weeks.push({
      weekLabel: `${fmt(from)} (${DAY[from.getDay()]}) ~ ${fmt(to)} (${DAY[to.getDay()]})`,
      dateFrom: iso(from),
      dateTo: iso(to),
    });
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

// ─── 주간 데이터 빌더 ────────────────────────────────────────
export function buildWeeks(yearMonth: string, sourceDays: DayRecord[]): WeekRecord[] {
  return generateWeeks(yearMonth).map(w => {
    const days = sourceDays.filter(d => d.date >= w.dateFrom && d.date <= w.dateTo);
    return {
      ...w,
      regularH:  days.reduce((a, d) => a + d.regularH,  0),
      overtimeH: days.reduce((a, d) => a + d.overtimeH, 0),
      nightH:    days.reduce((a, d) => a + d.nightH,    0),
      days,
    };
  });
}

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseAttendanceReturn {
  bridge: FlutterBridgeData;
  selectedMonth: string;
  showPopup: boolean;
  weeks: WeekRecord[];
  loaded: boolean;
  stats: AttendanceStats;
  workProgress: WorkProgress;
  monthOptions: string[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  btnLabel: string;
  btnDisabled: boolean;
  btnBg: string;
  onSelectMonth: (m: string) => void;
  onTogglePopup: () => void;
  onClosePopup: () => void;
  onNavigate: (path: string, state?: any) => void;
  onToggleAttendance: () => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useAttendance(): UseAttendanceReturn {
  const navigate = useNavigate();

  // 초깃값 없음 - Flutter에서 window.updateAttendanceInfo()로 주입받음
  const [bridge, setBridge] = useState<FlutterBridgeData>({
    userName: '',
    isVehicleConnected: false,
    plateNumber: '',
    vehicleName: '',
    connectionStatus: '연결 대기중',
    checkIn: '',
    checkOut: '',
  });

  useEffect(() => {
    (window as any).updateAttendanceInfo = (data: Partial<FlutterBridgeData>) =>
      setBridge((p) => ({ ...p, ...data }));
      
    (window as any).updateAttendance = (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString) as DayRecord[];
        setDayRecords(parsed);
        setLoaded(true);
      } catch(e) {
        console.error('Failed to parse attendance JSON', e);
        setDayRecords([]);
        setLoaded(true);
      }
    };

    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage('requestDriverInfo');
    }
  }, []);

  const today = new Date();
  const DEFAULT_MONTH = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}`;
  const initMonth = sessionStorage.getItem('attendance_month') || DEFAULT_MONTH;

  const [selectedMonth, setSelectedMonth] = useState<string>(initMonth);
  const [showPopup, setShowPopup]         = useState(false);
  const [dayRecords, setDayRecords]       = useState<DayRecord[]>([]);
  const [loaded, setLoaded]               = useState(false);

  // 선택한 월에 해당하는 주간 데이터 자동 연산
  const weeks = useMemo<WeekRecord[]>(() => buildWeeks(selectedMonth, dayRecords), [selectedMonth, dayRecords]);

  // 화면 로드 시 또는 월 선택 시 데이터 요청 함수 분리
  const fetchMonthData = (month: string) => {
    const targetWeeks = generateWeeks(month);
    if (targetWeeks.length > 0 && (window as any).FlutterBridge) {
      const dateFrom = targetWeeks[0].dateFrom;
      const dateTo   = targetWeeks[targetWeeks.length - 1].dateTo;
      (window as any).FlutterBridge.postMessage(
        JSON.stringify({ action: 'requestAttendance', dateFrom, dateTo })
      );
    } else {
      setTimeout(() => setLoaded(true), 500);
    }
  };

  // 초기 1회 로딩
  useEffect(() => {
    fetchMonthData(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCheckedIn = !!bridge.checkIn;
  const isCheckedOut = !!bridge.checkOut;

  let btnLabel = '출근 등록';
  let btnDisabled = false;
  let btnBg = '#3b82f6';

  if (!isCheckedIn) {
    btnLabel = '출근 등록';
    btnBg = '#3b82f6';
  } else if (!isCheckedOut) {
    btnLabel = `퇴근 등록 (출근: ${bridge.checkIn})`;
    btnBg = '#22c55e';
  } else {
    btnLabel = `업무 종료 (${bridge.checkIn} ~ ${bridge.checkOut})`;
    btnBg = '#9ca3af';
    btnDisabled = true;
  }

  const handleToggleAttendance = () => {
    if (!isCheckedIn) {
      if (window.confirm('지금 출근을 등록하시겠습니까?')) {
        if ((window as any).FlutterBridge) {
          (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'toggleAttendance', type: 'in' }));
        }
      }
    } else if (!isCheckedOut) {
      if (window.confirm(`지금 퇴근을 등록하시겠습니까?\\n\\n출근: ${bridge.checkIn}`)) {
        if ((window as any).FlutterBridge) {
          (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'toggleAttendance', type: 'out' }));
        }
      }
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('attendance_scroll');
    if (savedScroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  const stats = useMemo<AttendanceStats>(() => ({
    totalH:   weeks.reduce((a, w) => a + w.regularH + w.overtimeH + w.nightH, 0),
    regular:  weeks.reduce((a, w) => a + w.regularH,  0),
    overtime: weeks.reduce((a, w) => a + w.overtimeH, 0),
    night:    weeks.reduce((a, w) => a + w.nightH,    0),
  }), [weeks]);

  const workProgress = useMemo<WorkProgress>(() => {
    if (!bridge.checkIn) {
      return { pct: 0, label: '0시간 0분' };
    }
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const inMin  = toMin(bridge.checkIn);
    const outMin = bridge.checkOut ? toMin(bridge.checkOut) : inMin;
    const elapsed = Math.max(0, outMin - inMin);
    const pct     = Math.min(100, (elapsed / (8 * 60)) * 100);
    const h  = Math.floor(elapsed / 60);
    const mn = elapsed % 60;
    return { pct, label: mn > 0 ? `${h}시간 ${mn}분` : `${h}시간` };
  }, [bridge.checkIn, bridge.checkOut]);

  const onSelectMonth = (m: string) => {
    setSelectedMonth(m);
    sessionStorage.setItem('attendance_month', m);
    setShowPopup(false);
    setLoaded(false);
    fetchMonthData(m);
  };

  const onNavigate = (path: string, state?: any) => {
    if (scrollRef.current) {
      sessionStorage.setItem('attendance_scroll', scrollRef.current.scrollTop.toString());
    }
    navigate(path, { state });
  };

  return {
    bridge,
    selectedMonth,
    showPopup,
    weeks,
    loaded,
    stats,
    workProgress,
    monthOptions: MONTH_OPTIONS,
    scrollRef,
    btnLabel,
    btnDisabled,
    btnBg,
    onSelectMonth,
    onTogglePopup: () => setShowPopup((v) => !v),
    onClosePopup:  () => setShowPopup(false),
    onNavigate,
    onToggleAttendance: handleToggleAttendance,
  };
}
