import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface MaintenanceItem {
  id: string;
  name: string;
  elapsedKm: number;
  intervalKm: number;
}

export interface Vehicle {
  id: string;
  name: string; // 차량 모델명 (예: 벤츠 스프린터)
  plateNumber: string; // 번호판 (예: 154 후 5698)
}

export interface MaintenanceHistory {
  id: string;
  vehicleId: string;
  itemId: string;
  lastKm: number; // 최근 정비 시점의 누적 주행거리
  lastDate: string;
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

// 2. 정비 아이템 마스터 테이블
export const MAINTENANCE_MASTER = [
  { id: 'engine_oil',   name: '엔진오일',          intervalKm: 10000 },
  { id: 'air_filter',   name: '공기 / 에어컨 필터', intervalKm: 10000 },
  { id: 'battery',      name: '배터리',             intervalKm: 40000 },
  { id: 'trans_oil',    name: '변속기 오일',         intervalKm: 40000 },
  { id: 'tire',         name: '타이어',             intervalKm: 50000 },
  { id: 'spark_plug',   name: '점화플러그',          intervalKm: 60000 },
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

  useEffect(() => {
    const handleNativeMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'SYNC_VEHICLES' && Array.isArray(data.payload)) {
          setVehicles(data.payload);
        }
      } catch (e) {}
    };
    window.addEventListener('message', handleNativeMessage);
    
    import('../../bridge/nativeInterface').then(m => m.requestVehicles());
    return () => window.removeEventListener('message', handleNativeMessage);
  }, []);

  const onToggleVehicleMenu = () => setShowVehicleMenu((v) => !v);
  
  const onSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    setShowVehicleMenu(false);
  };


  const onItemClick = (item: MaintenanceItem) => {
    navigate('/maintenance/detail', { state: { item } });
  };

  const onRegisterClick = (item: MaintenanceItem) => {
    navigate('/maintenance/detail', { state: { item } });
  };

  // 선택된 차량에 해당하는 정비 항목 목록 계산 로직 (Join)
  const items: MaintenanceItem[] = selectedVehicleId 
    ? MAINTENANCE_MASTER.map((master, mi) => {
        // Native DB 정비 이력이 연동되기 전 임시 UI
        const hash = selectedVehicleId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        let elapsed = 2000 + (mi * 5000) + (hash * 1000 % 10000);
        if (master.id === 'air_filter') elapsed = 12000;
        if (master.id === 'battery' || master.id === 'trans_oil') elapsed = 32000;
        return {
          id: master.id,
          name: master.name,
          intervalKm: master.intervalKm,
          elapsedKm: elapsed,
        };
      })
    : []; // 선택 안 된 경우 빈 목록 반환

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

