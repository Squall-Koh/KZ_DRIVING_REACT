import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface MaintenanceItem {
  id: string;
  name: string;
  elapsedKm: number;
  intervalKm: number;
}

export interface FlutterBridgeData {
  userName: string;
  isVehicleConnected: boolean;
  plateNumber: string;
  vehicleName: string;
  connectionStatus: string;
}

// ─── 유틸 함수 ───────────────────────────────────────────────
export function barColor(elapsed: number, interval: number): string {
  const pct = elapsed / interval;
  if (pct >= 1)    return '#ef4444';
  if (pct >= 0.75) return '#f59e0b';
  return '#22c55e';
}

export function barWidth(elapsed: number, interval: number): number {
  return Math.min((elapsed / interval) * 100, 100);
}

// ─── 더미 데이터 ─────────────────────────────────────────────
const MAINTENANCE_ITEMS: MaintenanceItem[] = [
  { id: 'engine_oil',   name: '엔진오일',          elapsedKm:  2000, intervalKm: 10000 },
  { id: 'air_filter',   name: '공기 / 에어컨 필터', elapsedKm: 12000, intervalKm: 10000 },
  { id: 'battery',      name: '배터리',             elapsedKm: 32000, intervalKm: 40000 },
  { id: 'trans_oil',    name: '변속기 오일',         elapsedKm: 32000, intervalKm: 40000 },
  { id: 'tire',         name: '타이어',             elapsedKm:  2000, intervalKm: 50000 },
  { id: 'spark_plug',   name: '점화플러그',          elapsedKm:  2000, intervalKm: 60000 },
];

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseMaintenanceReturn {
  bridge: FlutterBridgeData;
  showVehicleMenu: boolean;
  items: MaintenanceItem[];
  onToggleVehicleMenu: () => void;
  onItemClick: (item: MaintenanceItem) => void;
  onRegisterClick: (item: MaintenanceItem) => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useMaintenance(): UseMaintenanceReturn {
  const navigate = useNavigate();
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);

  // 초깃값 없음 - Flutter에서 window.updateMaintenanceInfo()로 주입받음
  const [bridge, setBridge] = useState<FlutterBridgeData>({
    userName: '',
    isVehicleConnected: false,
    plateNumber: '',
    vehicleName: '',
    connectionStatus: '연결 대기중',
  });

  useEffect(() => {
    (window as any).updateMaintenanceInfo = (data: Partial<FlutterBridgeData>) =>
      setBridge((p) => ({ ...p, ...data }));
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage('requestDriverInfo');
    }
  }, []);

  const onToggleVehicleMenu = () => setShowVehicleMenu((v) => !v);

  const onItemClick = (item: MaintenanceItem) => {
    navigate('/maintenance/detail', { state: { item } });
  };

  const onRegisterClick = (item: MaintenanceItem) => {
    navigate('/maintenance/detail', { state: { item } });
  };

  return {
    bridge,
    showVehicleMenu,
    items: MAINTENANCE_ITEMS,
    onToggleVehicleMenu,
    onItemClick,
    onRegisterClick,
  };
}

