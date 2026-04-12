import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

// ─── 타입들 ────────────────────────────────────────────
export interface ObdDebugData {
  time: string;
  raw: string;
  km: number;
  rssi?: number;
  rpm?: number;
  voltage?: number;
}

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
  obdDebugData: ObdDebugData | null;
  onMoreAttendance: () => void;
  onMoreDriving: () => void;
  onMoreExpense: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  appVersion: string;
  scanRssi: number | null;
  isConnected: boolean;
}

export function useOperationDashboard(): UseOperationDashboardReturn {
  const navigate = useNavigate();
  
  const [recentDrivingData, setRecentDrivingData] = useState<any[]>([]);
  const [recentExpenseData, setRecentExpenseData] = useState<any[]>([]);
  const [obdDebugData, setObdDebugData] = useState<ObdDebugData | null>(null);
  const [appVersion, setAppVersion] = useState<string>('');
  
  const [scanRssi, setScanRssi] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const scanRssiTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'SYNC_OBD_DEBUG_DATA') {
          setObdDebugData(data.payload);
        } else if (data && data.type === 'SYNC_APP_VERSION') {
          const { version, buildNumber } = data.payload;
          setAppVersion(`ver. ${version}(${buildNumber})`);
        } else if (data && data.type === 'SYNC_DEVICE_FOUND') {
          setScanRssi(data.payload.rssi);
          if (scanRssiTimerRef.current) clearTimeout(scanRssiTimerRef.current);
          scanRssiTimerRef.current = setTimeout(() => setScanRssi(null), 5000);
        } else if (data && data.type === 'SYNC_BLE_CONNECTION') {
          setIsConnected(data.payload.connected);
          if (!data.payload.connected) {
            setObdDebugData(null);
            setScanRssi(null);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);

    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'requestDashboardData' }));
      (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'REQUEST_APP_VERSION' }));
    }
    
    return () => {
      delete (window as any).updateDashboardData;
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    drivingState: context.drivingState,
    cycleState: context.cycleState,
    syncPayload: context.syncPayload,
    recentDrivingData,
    recentExpenseData,
    obdDebugData,
    onMoreAttendance: () => navigate('/daily-trip-history'),
    onMoreDriving: () => navigate('/driving-history'),
    onMoreExpense: () => navigate('/receipts'),
    onCheckIn: () => {
      import('../../bridge/nativeInterface').then(m => m.triggerCheckIn());
    },
    onCheckOut: () => {
      import('../../bridge/nativeInterface').then(m => m.triggerCheckOut());
    },
    appVersion,
    scanRssi,
    isConnected,
  };
}
