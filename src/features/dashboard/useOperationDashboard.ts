import { useNavigate, useOutletContext } from 'react-router-dom';

// ─── 더미 데이터 ────────────────────────────────────────────
export const RECENT_DRIVING_DATA = [
  { id: 1, date: '26.03.01', vehicle: '벤츠 스프린터', plate: '154 후 5698', km: '30' },
  { id: 2, date: '26.02.28', vehicle: '카니발 하이리무진', plate: '154 후 5698', km: '16' },
  { id: 3, date: '26.02.28', vehicle: '카니발 하이리무진', plate: '154 후 5698', km: '22' },
];

export const RECENT_EXPENSE_DATA = [
  { id: 1, date: '26.03.01', merchant: 'CU 편의점 종각역점', amount: '54,000' },
  { id: 2, date: '26.02.28', merchant: 'SK 주유소 종각역점', amount: '50,000' },
  { id: 3, date: '26.02.27', merchant: 'SK 주유소 서울시청역 이름이 긴...', amount: '50,000' },
  { id: 4, date: '26.02.27', merchant: 'CU 편의점 종각역점', amount: '10,000' },
];

// ─── 로직 훅 ────────────────────────────────────────────────
export interface DrivingStateContext {
  drivingState: 0 | 1 | 2;
  cycleState: () => void;
}

export interface UseOperationDashboardReturn {
  drivingState: 0 | 1 | 2;
  cycleState: () => void;
  recentDrivingData: typeof RECENT_DRIVING_DATA;
  recentExpenseData: typeof RECENT_EXPENSE_DATA;
  onMoreAttendance: () => void;
  onMoreDriving: () => void;
  onMoreExpense: () => void;
  onCheckIn: () => void;
}

export function useOperationDashboard(): UseOperationDashboardReturn {
  const navigate = useNavigate();
  
  // React Router Outlet을 통해 MainLayout 쪽에서 주입해줄 상태를 받음
  const context = (useOutletContext<DrivingStateContext>() || { drivingState: 1, cycleState: () => {} });

  return {
    drivingState: context.drivingState,
    cycleState: context.cycleState,
    recentDrivingData: RECENT_DRIVING_DATA,
    recentExpenseData: RECENT_EXPENSE_DATA,
    onMoreAttendance: () => navigate('/daily-trip-history'),
    onMoreDriving: () => navigate('/driving-history'),
    onMoreExpense: () => navigate('/receipts'),
    onCheckIn: () => console.log('출근 등록 클릭됨'),
  };
}
