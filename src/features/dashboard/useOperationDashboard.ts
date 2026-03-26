import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

// ─── 타입들 ────────────────────────────────────────────

// ─── 로직 훅 ────────────────────────────────────────────────
export interface DrivingStateContext {
  drivingState: 0 | 1 | 2;
  cycleState: () => void;
  syncPayload: any;
}

export interface UseOperationDashboardReturn {
  drivingState: 0 | 1 | 2;
  cycleState: () => void;
  syncPayload: any;
  recentDrivingData: any[];
  recentExpenseData: any[];
  onMoreAttendance: () => void;
  onMoreDriving: () => void;
  onMoreExpense: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export function useOperationDashboard(): UseOperationDashboardReturn {
  const navigate = useNavigate();
  
  const [recentDrivingData, setRecentDrivingData] = useState<any[]>([]);
  const [recentExpenseData, setRecentExpenseData] = useState<any[]>([]);

  // React Router Outlet을 통해 MainLayout 쪽에서 주입해줄 상태를 받음
  const context = (useOutletContext<DrivingStateContext>() || { drivingState: 1, cycleState: () => {}, syncPayload: null });

  useEffect(() => {
    (window as any).updateDashboardData = (data: string) => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.trips) setRecentDrivingData(parsed.trips);
        if (parsed.expenses) setRecentExpenseData(parsed.expenses);
      } catch (e) {}
    };

    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'requestDashboardData' }));
    }
    
    return () => {
      delete (window as any).updateDashboardData;
    };
  }, []);

  return {
    drivingState: context.drivingState,
    cycleState: context.cycleState,
    syncPayload: context.syncPayload,
    recentDrivingData,
    recentExpenseData,
    onMoreAttendance: () => navigate('/daily-trip-history'),
    onMoreDriving: () => navigate('/driving-history'),
    onMoreExpense: () => navigate('/receipts'),
    onCheckIn: () => {
      import('../../bridge/nativeInterface').then(m => m.triggerCheckIn());
    },
    onCheckOut: () => {
      import('../../bridge/nativeInterface').then(m => m.triggerCheckOut());
    },
  };
}
