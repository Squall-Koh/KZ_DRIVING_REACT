import { useNavigate, useLocation } from 'react-router-dom';
import { type DayRecord } from '../../data/attendanceDummyData';

// ─── 타입 ────────────────────────────────────────────────────
export interface UseAttendanceDetailReturn {
  days: DayRecord[];
  weekLabel: string;
  headerParts: string[];
  month: string;
  onBack: () => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useAttendanceDetail(): UseAttendanceDetailReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) ?? {};

  const days: DayRecord[] = state.days     ?? [];
  const weekLabel: string = state.weekLabel ?? '';
  const month: string     = state.month    ?? '2026.03';

  const headerParts = weekLabel ? weekLabel.split(' ~ ') : [];

  return {
    days,
    weekLabel,
    headerParts,
    month,
    onBack: () => navigate(-1),
  };
}
