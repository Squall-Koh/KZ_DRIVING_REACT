import { useState, useEffect, useMemo } from 'react';
import drivingHistoryImg from '../../assets/driving_history.png';
import iconKz from '../../assets/icon_kz.png';
import iconMegaphone from '../../assets/icon_megaphone.png';

// ─── 타입 정의 ───────────────────────────────────────────────
interface TripRecord {
  id: number;
  departureAt: string;  // ISO: "2026-03-03T07:30:00"
  arrivalAt: string;    // ISO: "2026-03-03T08:50:00"
  distanceKm: number;
  plateNumber: string;
  vehicleName: string;
}

interface DayGroup {
  date: string;         // 표시용: "2026.03.03"
  trips: TripRecord[];
}

interface FlutterBridgeData {
  userName: string;
  isVehicleConnected: boolean;
  plateNumber: string;
  vehicleName: string;
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

// ─── 연월 선택지 생성 ─────────────────────────────────────
function generateMonthOptions(): string[] {
  const options: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    options.push(`${y}.${m}`);
  }
  return options;
}

const MONTH_OPTIONS = generateMonthOptions();
const TODAY_MONTH = MONTH_OPTIONS[0]; // 항상 현재 월이 첫 번째

// ─── 컴포넌트 ─────────────────────────────────────────────────
export function DrivingHistory() {
  // Flutter JS bridge state (userName, 차량연결 정보만)
  const [bridge, setBridge] = useState<FlutterBridgeData>({
    userName: '강무호',
    isVehicleConnected: true,
    plateNumber: '123 허 4567',
    vehicleName: '카니발 하이리무진',
  });

  // Flutter → WebView bridge
  useEffect(() => {
    (window as any).updateDriverInfo = (data: Partial<FlutterBridgeData>) => {
      setBridge((prev) => ({ ...prev, ...data }));
    };
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(TODAY_MONTH);
  const [showPopup, setShowPopup] = useState(false);
  const [trips, setTrips] = useState<DayGroup[]>(DUMMY_TRIPS[TODAY_MONTH] ?? []);
  const [loaded, setLoaded] = useState(true);

  // ── 통계 동적 계산 ────────────────────────────────────
  const stats = useMemo(() => {
    const allTrips = trips.flatMap((d) => d.trips);

    // 1. 전체 운행시간 (분 합계 → 시간)
    const totalMinutes = allTrips.reduce((acc, t) => {
      const dep = new Date(t.departureAt);
      const arr = new Date(t.arrivalAt);
      return acc + (arr.getTime() - dep.getTime()) / 60000;
    }, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10; // 소수점 1자리

    // 2. 전체 주행거리
    const totalDistanceKm = allTrips.reduce((acc, t) => acc + t.distanceKm, 0);

    // 3. 고유 차량번호 개수
    const uniquePlates = new Set(allTrips.map((t) => t.plateNumber));
    const totalVehicleCount = uniquePlates.size;

    return { totalHours, totalDistanceKm, totalVehicleCount };
  }, [trips]);

  // 연월 선택 시 데이터 로드
  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    setShowPopup(false);
    // ── 실제 API 호출 (추후 활성화) ──────────────────────────
    // const res = await fetch('/api/driving-history', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ month, userId: ... }),
    // });
    // const data: DayGroup[] = await res.json();
    // setTrips(data);

    // ── 더미 데이터: 선택된 월에 해당하는 데이터만 표시 ────
    setTrips(DUMMY_TRIPS[month] ?? []);
    setLoaded(true);
  };

  const hasTrips = trips.length > 0;

  return (
    <div style={styles.container}>

      {/* ── 고정 헤더 (스크롤 불가) ─────────────────────────── */}
      <div style={styles.fixedHeader}>
        {/* 사용자 정보 바 */}
        <div style={styles.userBar}>
          <div style={styles.userLeft}>
            <img src={iconKz} alt="kz" style={styles.logoIcon} />
            <span style={styles.userName}>{bridge.userName}님</span>
          </div>
        </div>

        {/* 차량 연결 상태 바 */}
        <div style={styles.vehicleBar}>
          <img src={iconMegaphone} alt="차량" style={styles.megaphoneIcon} />
          <span style={styles.vehicleBadge}>
            {bridge.isVehicleConnected ? '차량연결됨' : '차량미연결'}
          </span>
          <span style={styles.vehicleInfo}>
            [{bridge.plateNumber}] {bridge.vehicleName}
          </span>
        </div>

        {/* 통계 박스 - 선택된 월 데이터로 동적 계산 */}
        <div style={styles.statsBox}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>총 운행시간</span>
            <span style={styles.statValue}>{loaded ? stats.totalHours : '-'} 시간</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statLabel}>총 주행거리</span>
            <span style={{ ...styles.statValue, color: '#2563eb' }}>
              {loaded ? stats.totalDistanceKm.toLocaleString() : '-'} KM
            </span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statLabel}>이용 차량 수</span>
            <span style={{ ...styles.statValue, color: '#2563eb' }}>
              {loaded ? stats.totalVehicleCount : '-'} 대
            </span>
          </div>
        </div>

        {/* 연월 선택 버튼 */}
        <button style={styles.monthSelector} onClick={() => setShowPopup((v) => !v)}>
          <span style={styles.monthSelectorText}>
            {selectedMonth ? `${selectedMonth}월 운행내역` : '연/월을 선택하세요'}
          </span>
          <span style={{ ...styles.monthArrow, transform: showPopup ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>
      </div>

      {/* ── 스크롤 영역 (리스트 / 빈 화면) ─────────────────── */}
      <div style={styles.scrollArea}>
        {!loaded ? (
          <div style={styles.emptyWrapper}>
            <img src={drivingHistoryImg} alt="운행내역 없음" style={styles.emptyImage} />
            <p style={styles.emptyText}>조회된 운행 내역이 없습니다.</p>
          </div>
        ) : !hasTrips ? (
          <div style={styles.emptyWrapper}>
            <img src={drivingHistoryImg} alt="운행내역 없음" style={styles.emptyImage} />
            <p style={styles.emptyText}>조회된 운행 내역이 없습니다.</p>
          </div>
        ) : (
          <div style={styles.listWrapper}>
            {trips.map((day) => (
              <div key={day.date} style={styles.dayGroup}>
                <div style={styles.dayHeader}>
                  <span style={styles.dayDate}>{day.date}</span>
                  <span style={styles.dayCount}>총 {day.trips.length}건</span>
                </div>
                <div style={styles.timeline}>
                  {day.trips.map((trip, idx) => (
                    <div key={trip.id} style={styles.timelineRow}>
                      <div style={styles.timelineDotCol}>
                        <div style={styles.timelineDot} />
                        {idx < day.trips.length - 1 && (
                          <div style={styles.timelineLine} />
                        )}
                      </div>
                      <div style={{
                        ...styles.tripCard,
                        marginBottom: idx < day.trips.length - 1 ? '8px' : '0',
                      }}>
                        <div style={styles.tripTop}>
                          <span style={styles.tripTime}>
                            {trip.departureAt.slice(11, 16)} ~ {trip.arrivalAt.slice(11, 16)}
                          </span>
                          <span style={styles.tripDistance}>
                            <span style={styles.tripDistanceNum}>{trip.distanceKm}</span>
                            <span style={styles.tripDistanceUnit}> km</span>
                          </span>
                        </div>
                        <div style={styles.tripBottom}>
                          {trip.plateNumber} | {trip.vehicleName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 연월 선택 모달 오버레이 ───────────────────────────── */}
      {showPopup && (
        <div style={styles.overlay} onClick={() => setShowPopup(false)}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              <span style={styles.popupTitle}>조회연월 선택</span>
              <span style={styles.popupClose} onClick={() => setShowPopup(false)}>∧</span>
            </div>
            <div style={styles.popupList}>
              {MONTH_OPTIONS.map((m) => (
                <div
                  key={m}
                  style={{
                    ...styles.popupItem,
                    ...(m === selectedMonth ? styles.popupItemSelected : {}),
                  }}
                  onClick={() => handleSelectMonth(m)}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f5f7',
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
    overflow: 'hidden',
  },

  /* 고정 헤더 (스크롤 불가) */
  fixedHeader: {
    flexShrink: 0,
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    backgroundColor: '#f5f5f7',
  },

  /* 사용자 바 */
  userBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px 8px',
  },
  userLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    width: '28px',
    height: '28px',
    objectFit: 'contain',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111111',
  },

  /* 차량 연결 바 */
  vehicleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 16px 8px',
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    border: '1px solid #e0e7ff',
  },
  megaphoneIcon: {
    width: '18px',
    height: '18px',
    objectFit: 'contain',
  },
  vehicleBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
    whiteSpace: 'nowrap' as const,
  },
  vehicleInfo: {
    fontSize: '12px',
    color: '#444444',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  /* 스크롤 영역 */
  scrollArea: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column',
  },

  /* 통계 박스 */
  statsBox: {
    display: 'flex',
    backgroundColor: '#ffffff',
    margin: '0 16px 8px',
    padding: '14px 0',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statDivider: {
    width: '1px',
    backgroundColor: '#eeeeee',
    margin: '4px 0',
  },
  statLabel: {
    fontSize: '11px',
    color: '#888888',
  },
  statValue: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#111111',
  },

  /* 연월 선택 버튼 */
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    width: 'calc(100% - 32px)',
    margin: '0 16px 8px',
    textAlign: 'left' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  monthSelectorText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#222222',
  },
  monthArrow: {
    fontSize: '11px',
    color: '#888888',
    transition: 'transform 0.2s',
  },

  /* 모달 오버레이 */
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  /* 팝업 박스 */
  popup: {
    width: '80%',
    maxWidth: '320px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,0,0,0.16)',
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  popupTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333333',
  },
  popupClose: {
    fontSize: '16px',
    color: '#888888',
    cursor: 'pointer',
  },
  popupList: {
    maxHeight: '240px',
    overflowY: 'auto' as const,
  },
  popupItem: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#333333',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
  },
  popupItemSelected: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: '600',
  },

  /* 빈 상태 */
  emptyWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '60px 0',
  },
  emptyImage: {
    width: '130px',
    height: '130px',
    objectFit: 'contain',
  },
  emptyText: {
    fontSize: '14px',
    color: '#888888',
    margin: 0,
  },

  /* 운행 목록 */
  listWrapper: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
  },
  dayGroup: {
    marginBottom: '8px',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px 6px',
  },
  dayDate: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333333',
  },
  dayCount: {
    fontSize: '11px',
    color: '#aaaaaa',
  },

  /* 타임라인 */
  timeline: {
    padding: '0 16px',
  },
  timelineRow: {
    display: 'flex',
    gap: '10px',
  },
  timelineDotCol: {
    position: 'relative' as const,   // 선의 absolute 기준점
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',        // dot을 카드 세로 중앙에 정렬
    width: '12px',
    flexShrink: 0,
    alignSelf: 'stretch' as const,   // 카드 높이만큼 확장
  },
  timelineDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#cbd5e1',
    flexShrink: 0,
    position: 'relative' as const,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute' as const,
    top: 'calc(50% + 5px)',      // 현재 dot 중앙(50%) + 반지름(5px) = dot 바로 아래
    bottom: 'calc(-50% - 8px)', // 다음 카드 중앙(50%) + 카드간격(8px) = 다음 dot 중앙까지
    left: '5px',                 // (12 - 2) / 2 = 중앙 정렬
    width: '2px',
    backgroundColor: '#e2e8f0',
    zIndex: 0,
  },

  /* 운행 카드 */
  tripCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '12px 14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  tripTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  tripTime: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#222222',
  },
  tripDistance: {
    display: 'flex',
    alignItems: 'baseline',
  },
  tripDistanceNum: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#10b981',
  },
  tripDistanceUnit: {
    fontSize: '12px',
    color: '#10b981',
    marginLeft: '2px',
  },
  tripBottom: {
    fontSize: '12px',
    color: '#888888',
  },
};
