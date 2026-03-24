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

// ─── Dummy 더이상 사용 안함 (DB 실데이터 연동) ───────────

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
  useEffect(() => {
    (window as any).updateDriverInfo = (data: Partial<FlutterBridgeData>) => {
      setBridge((prev) => ({ ...prev, ...data }));
    };
    (window as any).updateDrivingHistory = (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString) as DayGroup[];
        setTrips(parsed);
        setLoaded(true);
      } catch (e) {
        console.error('Failed to parse driving history JSON', e);
        setTrips([]);
        setLoaded(true);
      }
    };

    // 함수 등록 완료 후 Flutter에 데이터 요청
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage('requestDriverInfo');
      // 초기 로딩 시 이번 달 내역 요청
      (window as any).FlutterBridge.postMessage(
        JSON.stringify({ action: 'requestDrivingHistory', month: TODAY_MONTH })
      );
    } else {
      // 모바일이 아닌 환경(웹 브라우저)일 때 처리
      setTimeout(() => setLoaded(true), 500);
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

    // Flutter에 해당 월 데이터 요청
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(
        JSON.stringify({ action: 'requestDrivingHistory', month })
      );
    } else {
      setTimeout(() => {
        setTrips([]); // 웹 테스트 환경
        setLoaded(true);
      }, 500);
    }
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
