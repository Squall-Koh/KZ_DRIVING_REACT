import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface MaintenanceItem {
  id: number;
  name: string;
  elapsedKm: number | null;
  intervalKm: number;
  lastMaintenanceDate?: string;
}

export interface Vehicle {
  id: string;
  name: string; // 차량 모델명 (예: 벤츠 스프린터)
  plateNumber: string; // 번호판 (예: 154 후 5698)
  finalDistance?: number;
}

export interface MaintenanceHistory {
  id: number;
  vehicleId: string;
  itemId: number;
  lastKm: number;
  lastDate: string;
}

export interface MaintenanceStatus {
  itemId: number;
  lastDate: string;
  lastKm: number;
}

// ─── 유틸 함수 ───────────────────────────────────────────────
export function barColor(elapsed: number | null, interval: number): string {
  if (elapsed === null) return '#e5e7eb';
  const pct = elapsed / interval;
  if (pct >= 1)    return '#ef4444';
  if (pct >= 0.75) return '#f59e0b';
  return '#22c55e';
}

export function barWidth(elapsed: number | null, interval: number): number {
  if (elapsed === null) return 0;
  return Math.min((elapsed / interval) * 100, 100);
}

// 2. 정비 아이템 마스터 테이블 (id는 DB INTEGER AUTOINCREMENT: 1~6)
export const MAINTENANCE_MASTER = [
  { id: 1, name: '엔진오일',          intervalKm: 10000 },
  { id: 2, name: '공기 / 에어컨 필터', intervalKm: 10000 },
  { id: 3, name: '배터리',             intervalKm: 40000 },
  { id: 4, name: '변속기 오일',         intervalKm: 40000 },
  { id: 5, name: '타이어',             intervalKm: 50000 },
  { id: 6, name: '점화플러그',          intervalKm: 60000 },
];

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseMaintenanceReturn {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  showVehicleMenu: boolean;
  items: MaintenanceItem[];
  onSelectVehicle: (id: string) => void;
  onToggleVehicleMenu: () => void;
  onItemClick: (item: MaintenanceItem) => void;
  onRegisterClick: (item: MaintenanceItem) => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useMaintenance(): UseMaintenanceReturn {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(''); // 아무 것도 선택되지 않은 상태
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus[]>([]);

  useEffect(() => {
    const handleNativeMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'SYNC_VEHICLES' && Array.isArray(data.payload)) {
          setVehicles(data.payload);
        } else if (data.type === 'SYNC_MAINTENANCE_STATUS' && Array.isArray(data.payload)) {
          setMaintenanceStatus(data.payload);
        }
      } catch (e) {}
    };
    window.addEventListener('message', handleNativeMessage);
    
    import('../../bridge/nativeInterface').then(m => m.requestVehicles());
    return () => window.removeEventListener('message', handleNativeMessage);
  }, []);

  useEffect(() => {
    if (selectedVehicleId) {
      import('../../bridge/nativeInterface').then(m => m.requestMaintenanceStatus(selectedVehicleId));
    } else {
      setMaintenanceStatus([]);
    }
  }, [selectedVehicleId]);

  const onToggleVehicleMenu = () => setShowVehicleMenu((v) => !v);
  
  const onSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    setShowVehicleMenu(false);
  };


  const selectedVehicle = vehicles.find(v => String(v.id) === String(selectedVehicleId));

  const onItemClick = (item: MaintenanceItem) => {
    navigate('/maintenance/detail', { state: { item, vehicle: selectedVehicle } });
  };

  const onRegisterClick = (item: MaintenanceItem) => {
    navigate('/maintenance/detail', { state: { item, vehicle: selectedVehicle } });
  };

  // 선택된 차량에 해당하는 정비 항목 목록 계산 로직
  const items: MaintenanceItem[] = selectedVehicleId 
    ? MAINTENANCE_MASTER.map((master) => {
        const historyRow = maintenanceStatus.find(s => Number(s.itemId) === master.id);
        let elapsedKm: number | null = null;
        let lastDate: string | undefined = undefined;

        if (historyRow) {
          const finalDist = selectedVehicle?.finalDistance || 0;
          elapsedKm = Math.max(0, finalDist - historyRow.lastKm);
          lastDate = historyRow.lastDate;
        }

        return {
          id: master.id,
          name: master.name,
          intervalKm: master.intervalKm,
          elapsedKm,
          lastMaintenanceDate: lastDate,
        };
      })
    : [];

  return {
    vehicles,
    selectedVehicleId,
    showVehicleMenu,
    items,
    onSelectVehicle,
    onToggleVehicleMenu,
    onItemClick,
    onRegisterClick,
  };
}

