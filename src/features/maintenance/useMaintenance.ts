import { useState } from 'react';
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

// ─── 더미 데이터 (테이블 모의) ─────────────────────────────────────────────
// 1. 차량 테이블 (Vehicles)
export const DUMMY_VEHICLES: Vehicle[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `v${i + 1}`,
  name: ['벤츠 스프린터', '제네시스 GV80', '기아 카니발', '현대 그랜저', '아이오닉 5'][i % 5],
  plateNumber: `${100 + i} 가 ${1000 + i}`,
}));

// 2. 정비 아이템 마스터 테이블
export const MAINTENANCE_MASTER = [
  { id: 'engine_oil',   name: '엔진오일',          intervalKm: 10000 },
  { id: 'air_filter',   name: '공기 / 에어컨 필터', intervalKm: 10000 },
  { id: 'battery',      name: '배터리',             intervalKm: 40000 },
  { id: 'trans_oil',    name: '변속기 오일',         intervalKm: 40000 },
  { id: 'tire',         name: '타이어',             intervalKm: 50000 },
  { id: 'spark_plug',   name: '점화플러그',          intervalKm: 60000 },
];

// 3. 차량별 정비 이력 테이블 (Random Dummy)
export const DUMMY_HISTORY: MaintenanceHistory[] = [];
DUMMY_VEHICLES.forEach((v, vi) => {
  MAINTENANCE_MASTER.forEach((m, mi) => {
    // 임의의 경과 킬로수 세팅 (이미지와 비슷하게 일부러 오버된 값 포함)
    let elapsed = 2000 + (mi * 5000) + (vi * 1000);
    if (m.id === 'air_filter') elapsed = 12000;
    if (m.id === 'battery' || m.id === 'trans_oil') elapsed = 32000;
    
    DUMMY_HISTORY.push({
      id: `h_${v.id}_${m.id}`,
      vehicleId: v.id,
      itemId: m.id,
      lastKm: 100000 - elapsed, // 가상의 마지막 정비 킬로수
      lastDate: '2025-01-01',
    });
  });
});

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
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(''); // 아무 것도 선택되지 않은 상태

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
    ? MAINTENANCE_MASTER.map(master => {
        // vehicleId와 itemId로 이력 탐색
        const history = DUMMY_HISTORY.find(h => h.vehicleId === selectedVehicleId && h.itemId === master.id);
        const currentTotalKm = 100000; // 가상의 현재 누적 킬로수
        const elapsedKm = history ? currentTotalKm - history.lastKm : 0;
        return {
          id: master.id,
          name: master.name,
          intervalKm: master.intervalKm,
          elapsedKm,
        };
      })
    : []; // 선택 안 된 경우 빈 목록 반환

  return {
    vehicles: DUMMY_VEHICLES,
    selectedVehicleId,
    showVehicleMenu,
    items,
    onSelectVehicle,
    onToggleVehicleMenu,
    onItemClick,
    onRegisterClick,
  };
}

