import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { DrivingStateContext } from '../dashboard/useOperationDashboard';

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

export interface AttendanceStats {
  totalH: number;
  regular: number;
  overtime: number;
  night: number;
}

// ─── 연월 선택지 ──────────────────────────────────────────────
function generateMonthOptions(): string[] {
  const opts: string[] = [];
  const base = new Date();
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

  // Start with 1st of the month
  const firstDay = new Date(y, m - 1, 1);
  const startSun = new Date(firstDay);
  startSun.setDate(firstDay.getDate() - firstDay.getDay());
  
  // End with last of the month
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

// ─── 시간 포맷 헬퍼 ──────────────────────────────────────────
const formatTime = (isoString: string) => {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseAttendanceReturn {
  syncPayload: any;
  selectedMonth: string;
  showPopup: boolean;
  weeks: WeekRecord[];
  loaded: boolean;
  stats: AttendanceStats;
  monthOptions: string[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  workTimeStr: string;
  progressPercent: number;
  primaryBtnText: string;
  primaryBtnColor: string;
  checkInTimeStr: string;
  checkOutTimeStr: string;
  onSelectMonth: (m: string) => void;
  onTogglePopup: () => void;
  onClosePopup: () => void;
  onNavigate: (path: string, state?: any) => void;
  onCheckInClick: () => void;
  onConfirmCheckIn: () => void;
  isCheckInConfirmOpen: boolean;
  setIsCheckInConfirmOpen: (b: boolean) => void;
  onCheckOutClick: () => void;
  onConfirmCheckOut: () => void;
  isCheckOutConfirmOpen: boolean;
  setIsCheckOutConfirmOpen: (b: boolean) => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useAttendance(): UseAttendanceReturn {
  const navigate = useNavigate();
  const { syncPayload } = useOutletContext<DrivingStateContext>();

  useEffect(() => {
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
  }, []);

  const today = new Date();
  const DEFAULT_MONTH = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}`;
  const initMonth = sessionStorage.getItem('attendance_month') || DEFAULT_MONTH;

  const [selectedMonth, setSelectedMonth] = useState<string>(initMonth);
  const [showPopup, setShowPopup]         = useState(false);
  const [dayRecords, setDayRecords]       = useState<DayRecord[]>([]);
  const [loaded, setLoaded]               = useState(false);
  const [isCheckInConfirmOpen, setIsCheckInConfirmOpen]   = useState(false);
  const [isCheckOutConfirmOpen, setIsCheckOutConfirmOpen] = useState(false);

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

  const workDay = syncPayload?.workDay;
  const isCheckedIn = !!workDay;
  const isCheckedOut = !!workDay?.checkOutTime;

  const checkInTimeStr = workDay?.checkInTime ? formatTime(workDay.checkInTime) : '--:--';
  const checkOutTimeStr = workDay?.checkOutTime ? formatTime(workDay.checkOutTime) : '--:--';

  let workTimeStr = '';
  let progressPercent = 0;
  const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

  if (isCheckedIn && workDay?.checkInTime) {
    const dIn = new Date(workDay.checkInTime);
    const dOut = isCheckedOut && workDay?.checkOutTime ? new Date(workDay.checkOutTime) : new Date();
    const diffMs = dOut.getTime() - dIn.getTime();
    if (!isNaN(diffMs) && diffMs >= 0) {
      const diffMins = Math.floor(diffMs / 60000);
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      workTimeStr = `${h}시간 ${m}분`;
      progressPercent = Math.min(100, (diffMs / EIGHT_HOURS_MS) * 100);
    }
  }

  const primaryBtnText = isCheckedIn ? (isCheckedOut ? `퇴근완료 (${checkInTimeStr} - ${checkOutTimeStr})` : '퇴근 등록') : '출근 등록';
  const primaryBtnColor = isCheckedIn ? (isCheckedOut ? '#ced4da' : '#22c55e') : '#2B5CFF';

  const onCheckInClick = () => {
    setIsCheckInConfirmOpen(true);
  };

  const onConfirmCheckIn = () => {
    setIsCheckInConfirmOpen(false);
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'CHECK_IN' }));
    }
  };

  const onCheckOutClick = () => {
    setIsCheckOutConfirmOpen(true);
  };

  const onConfirmCheckOut = () => {
    setIsCheckOutConfirmOpen(false);
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'CHECK_OUT' }));
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
    syncPayload,
    selectedMonth,
    showPopup,
    weeks,
    loaded,
    stats,
    monthOptions: MONTH_OPTIONS,
    scrollRef,
    workTimeStr,
    progressPercent,
    primaryBtnText,
    primaryBtnColor,
    checkInTimeStr,
    checkOutTimeStr,
    onSelectMonth,
    onTogglePopup: () => setShowPopup((v) => !v),
    onClosePopup:  () => setShowPopup(false),
    onNavigate,
    onCheckInClick,
    onConfirmCheckIn,
    isCheckInConfirmOpen,
    setIsCheckInConfirmOpen,
    onCheckOutClick,
    onConfirmCheckOut,
    isCheckOutConfirmOpen,
    setIsCheckOutConfirmOpen,
  };
}
