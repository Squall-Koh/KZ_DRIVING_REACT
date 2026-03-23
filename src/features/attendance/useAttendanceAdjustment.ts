import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── 타입 ────────────────────────────────────────────────────
export interface AdjustmentRecord {
  id: number;
  submitDate: string;
  workDate: string;
  timeFrom: string;
  timeTo: string;
  status: '결재대기' | '결재완료' | '결재반려';
}

export type AdjustTabType = 'adjust' | 'approval';

const DUMMY_ADJUSTMENTS: AdjustmentRecord[] = [
  { id: 1, submitDate: '2026.03.01', workDate: '2026.02.28', timeFrom: '08:30', timeTo: '17:30', status: '결재대기' },
  { id: 2, submitDate: '2026.02.13', workDate: '2026.02.12', timeFrom: '08:30', timeTo: '17:30', status: '결재완료' },
  { id: 3, submitDate: '2026.01.30', workDate: '2026.01.28', timeFrom: '08:30', timeTo: '17:30', status: '결재반려' },
  { id: 4, submitDate: '2026.01.13', workDate: '2026.01.13', timeFrom: '08:30', timeTo: '17:30', status: '결재완료' },
  { id: 5, submitDate: '2025.12.13', workDate: '2025.12.13', timeFrom: '08:30', timeTo: '17:30', status: '결재완료' },
];

export const STATUS_STYLE: Record<string, React.CSSProperties> = {
  '결재대기': { color: '#2563eb', backgroundColor: '#eff6ff' },
  '결재완료': { color: '#16a34a', backgroundColor: '#f0fdf4' },
  '결재반려': { color: '#dc2626', backgroundColor: '#fef2f2' },
};

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseAttendanceAdjustmentReturn {
  tab: AdjustTabType;
  workDate: string;
  timeFrom: string;
  timeTo: string;
  file: string;
  clockTarget: 'from' | 'to' | null;
  showCount: number;
  adjustments: AdjustmentRecord[];
  onTabChange: (t: AdjustTabType) => void;
  onWorkDateChange: (d: string) => void;
  onTimeFromChange: (t: string) => void;
  onTimeToChange: (t: string) => void;
  onFileChange: (f: string) => void;
  onClockTargetChange: (t: 'from' | 'to' | null) => void;
  onShowMore: () => void;
  onBack: () => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useAttendanceAdjustment(): UseAttendanceAdjustmentReturn {
  const navigate = useNavigate();

  const [tab, setTab]               = useState<AdjustTabType>('adjust');
  const [workDate, setWorkDate]     = useState('');
  const [timeFrom, setTimeFrom]     = useState('08:30');
  const [timeTo, setTimeTo]         = useState('17:30');
  const [file, setFile]             = useState('사진_20260301.PNG');
  const [clockTarget, setClockTarget] = useState<'from' | 'to' | null>(null);
  const [showCount, setShowCount]   = useState(5);

  return {
    tab,
    workDate,
    timeFrom,
    timeTo,
    file,
    clockTarget,
    showCount,
    adjustments: DUMMY_ADJUSTMENTS,
    onTabChange:        setTab,
    onWorkDateChange:   setWorkDate,
    onTimeFromChange:   setTimeFrom,
    onTimeToChange:     setTimeTo,
    onFileChange:       setFile,
    onClockTargetChange: setClockTarget,
    onShowMore:         () => setShowCount((n) => n + 5),
    onBack:             () => navigate('/attendance'),
  };
}
