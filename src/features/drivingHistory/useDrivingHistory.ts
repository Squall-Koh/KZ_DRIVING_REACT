import { useState, useEffect, useMemo } from 'react';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface TripRecord {
  id: number;
  departureAt: string;  // ISO: "2026-03-03T07:30:00"
  arrivalAt: string;    // ISO: "2026-03-03T08:50:00"
  distanceKm: number;
  plateNumber: string;
  vehicleName: string;
}

export interface DayGroup {
  date: string;         // 표시용: "2026.03.03"
  trips: TripRecord[];
}

export interface FlutterBridgeData {
  userName: string;
  isVehicleConnected: boolean;
  plateNumber: string;
  vehicleName: string;
  connectionStatus: string;
}

export interface TripStats {
  totalHours: number;
  totalDistanceKm: number;
  totalVehicleCount: number;
}

// ─── Dummy 운행 데이터 (월별 Map) ───────────────────────────
const DUMMY_TRIPS: Record<string, DayGroup[]> = {
  '2026.03': [
    {
      date: '2026.03.03',
      trips: [
        { id: 1, departureAt: '2026-03-03T07:30:00', arrivalAt: '2026-03-03T08:50:00', distanceKm: 16, plateNumber: '154 후 5698', vehicleName: '벤츠 스프린터' },
      ],
    },
    {
      date: '2026.03.02',
      trips: [
        { id: 2, departureAt: '2026-03-02T07:30:00', arrivalAt: '2026-03-02T08:50:00', distanceKm: 22, plateNumber: '154 후 5698', vehicleName: '벤츠 스프린터' },
        { id: 3, departureAt: '2026-03-02T09:10:00', arrivalAt: '2026-03-02T11:40:00', distanceKm: 123, plateNumber: '154 후 5698', vehicleName: '벤츠 스프린터' },
        { id: 4, departureAt: '2026-03-02T13:00:00', arrivalAt: '2026-03-02T14:20:00', distanceKm: 23, plateNumber: '154 후 5698', vehicleName: '벤츠 스프린터' },
      ],
    },
    {
      date: '2026.03.01',
      trips: [
        { id: 5, departureAt: '2026-03-01T07:30:00', arrivalAt: '2026-03-01T08:50:00', distanceKm: 22, plateNumber: '154 후 5698', vehicleName: '벤츠 스프린터' },
        { id: 6, departureAt: '2026-03-01T10:00:00', arrivalAt: '2026-03-01T12:30:00', distanceKm: 123, plateNumber: '154 후 5698', vehicleName: '벤츠 스프린터' },
      ],
    },
  ],
  '2026.02': [
    {
      date: '2026.02.28',
      trips: [
        { id: 7, departureAt: '2026-02-28T08:00:00', arrivalAt: '2026-02-28T09:15:00', distanceKm: 31, plateNumber: '154 후 5698', vehicleName: '벤츠 스프린터' },
      ],
    },
    {
      date: '2026.02.27',
      trips: [
        { id: 8, departureAt: '2026-02-27T07:45:00', arrivalAt: '2026-02-27T09:00:00', distanceKm: 18, plateNumber: '123 허 4567', vehicleName: '카니발 하이리무진' },
        { id: 9, departureAt: '2026-02-27T14:00:00', arrivalAt: '2026-02-27T16:30:00', distanceKm: 87, plateNumber: '123 허 4567', vehicleName: '카니발 하이리무진' },
      ],
    },
  ],
  '2026.01': [
    {
      date: '2026.01.15',
      trips: [
        { id: 10, departureAt: '2026-01-15T09:00:00', arrivalAt: '2026-01-15T10:30:00', distanceKm: 45, plateNumber: '123 허 4567', vehicleName: '카니발 하이리무진' },
      ],
    },
  ],
};

// ─── 연월 선택지 생성 ─────────────────────────────────────────
function generateMonthOptions(): string[] {
  const options: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i);
    options.push(`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return options;
}

export const MONTH_OPTIONS = generateMonthOptions();
export const TODAY_MONTH = MONTH_OPTIONS[0];

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseDrivingHistoryReturn {
  bridge: FlutterBridgeData;
  selectedMonth: string | null;
  showPopup: boolean;
  trips: DayGroup[];
  loaded: boolean;
  stats: TripStats;
  monthOptions: string[];
  onSelectMonth: (month: string) => void;
  onTogglePopup: () => void;
  onClosePopup: () => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useDrivingHistory(): UseDrivingHistoryReturn {
  // 초깃값 없음 - Flutter에서 window.updateDriverInfo()로 주입받음
  const [bridge, setBridge] = useState<FlutterBridgeData>({
    userName: '',
    isVehicleConnected: false,
    plateNumber: '',
    vehicleName: '',
    connectionStatus: '연결 대기중',
  });

  // React → Flutter → React 양방향 bridge
  // 1. window.updateDriverInfo 등록
  // 2. Flutter에 'requestDriverInfo' 전송 → Flutter가 runJavaScript로 응답
  useEffect(() => {
    (window as any).updateDriverInfo = (data: Partial<FlutterBridgeData>) => {
      setBridge((prev) => ({ ...prev, ...data }));
    };
    // 함수 등록 완료 후 Flutter에 데이터 요청
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage('requestDriverInfo');
    }
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(TODAY_MONTH);
  const [showPopup, setShowPopup] = useState(false);
  const [trips, setTrips] = useState<DayGroup[]>([]);  // 빈 배열 - API 연동 전까지는 월 선택 시 로드
  const [loaded, setLoaded] = useState(false);         // false = 아직 데이터 없음

  // ── 통계 동적 계산 ────────────────────────────────────────
  const stats = useMemo<TripStats>(() => {
    const allTrips = trips.flatMap((d) => d.trips);

    const totalMinutes = allTrips.reduce((acc, t) => {
      const dep = new Date(t.departureAt);
      const arr = new Date(t.arrivalAt);
      return acc + (arr.getTime() - dep.getTime()) / 60000;
    }, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const totalDistanceKm = allTrips.reduce((acc, t) => acc + t.distanceKm, 0);

    const uniquePlates = new Set(allTrips.map((t) => t.plateNumber));
    const totalVehicleCount = uniquePlates.size;

    return { totalHours, totalDistanceKm, totalVehicleCount };
  }, [trips]);

  const onSelectMonth = (month: string) => {
    setSelectedMonth(month);
    setShowPopup(false);
    setLoaded(false);
    // ── 실제 API 호출 (추후 활성화) ──────────────────────────
    // const res = await fetch('/api/driving-history', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ month }),
    // });
    // const data: DayGroup[] = await res.json();
    // setTrips(data);
    // setLoaded(true);

    // ── 개발용 임시: DUMMY_TRIPS 참조 (API 연동 후 제거) ─────
    setTrips(DUMMY_TRIPS[month] ?? []);
    setLoaded(true);
  };

  const onTogglePopup = () => setShowPopup((v) => !v);
  const onClosePopup  = () => setShowPopup(false);

  return {
    bridge,
    selectedMonth,
    showPopup,
    trips,
    loaded,
    stats,
    monthOptions: MONTH_OPTIONS,
    onSelectMonth,
    onTogglePopup,
    onClosePopup,
  };
}
