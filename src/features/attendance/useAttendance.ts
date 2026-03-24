import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_DUMMY_DAYS, type DayRecord } from '../../data/attendanceDummyData';

// ─── 타입 ────────────────────────────────────────────────────
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
export function buildWeeks(yearMonth: string): WeekRecord[] {
  return generateWeeks(yearMonth).map(w => {
    const days = ALL_DUMMY_DAYS.filter(d => d.date >= w.dateFrom && d.date <= w.dateTo);
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
  scrollRef: React.RefObject<HTMLDivElement>;
  onSelectMonth: (m: string) => void;
  onTogglePopup: () => void;
  onClosePopup: () => void;
  onNavigate: (path: string, state?: any) => void;
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
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage('requestDriverInfo');
    }
  }, []);

  const today = new Date();
  const DEFAULT_MONTH = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}`;
  const initMonth = sessionStorage.getItem('attendance_month') || DEFAULT_MONTH;

  const [selectedMonth, setSelectedMonth] = useState<string>(initMonth);
  const [showPopup, setShowPopup]         = useState(false);
  const [weeks, setWeeks]                 = useState<WeekRecord[]>(buildWeeks(initMonth));
  const [loaded, setLoaded]               = useState(true);

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
    setWeeks(buildWeeks(m));
    setLoaded(true);
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
    onSelectMonth,
    onTogglePopup: () => setShowPopup((v) => !v),
    onClosePopup:  () => setShowPopup(false),
    onNavigate,
  };
}
