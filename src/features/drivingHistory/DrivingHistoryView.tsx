import React from 'react';
import drivingHistoryImg from '../../assets/driving_history.png';
import type {
  DayGroup,
  TripRecord,
  FlutterBridgeData,
  TripStats,
} from './useDrivingHistory';

// ─── Props 타입 ──────────────────────────────────────────────
interface DrivingHistoryViewProps {
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

// ─── 빈 상태 ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={styles.emptyWrapper}>
      <img src={drivingHistoryImg} alt="운행내역 없음" style={styles.emptyImage} />
      <p style={styles.emptyText}>조회된 운행 내역이 없습니다.</p>
    </div>
  );
}

// ─── 운행 카드 ───────────────────────────────────────────────
function TripCard({ trip, isLast }: { trip: TripRecord; isLast: boolean }) {
  return (
    <div style={{ ...styles.tripCard, marginBottom: isLast ? '0' : '8px' }}>
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
  );
}

// ─── 하루 그룹 ───────────────────────────────────────────────
function DayGroupItem({ day }: { day: DayGroup }) {
  return (
    <div style={styles.dayGroup}>
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
            <TripCard trip={trip} isLast={idx === day.trips.length - 1} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── View 컴포넌트 (순수 UI) ─────────────────────────────────
export function DrivingHistoryView({
  bridge,
  selectedMonth,
  showPopup,
  trips,
  loaded,
  stats,
  monthOptions,
  onSelectMonth,
  onTogglePopup,
  onClosePopup,
}: DrivingHistoryViewProps) {
  const hasTrips = trips.length > 0;

  return (
    <div style={styles.container}>

      {/* ── 고정 영역 (통계 및 필터) ────────────────────────── */}
      <div style={styles.fixedHeader}>

        {/* 통계 박스 */}
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
        <button style={styles.monthSelector} onClick={onTogglePopup}>
          <span style={styles.monthSelectorText}>
            {selectedMonth ? `${selectedMonth}월 운행내역` : '연/월을 선택하세요'}
          </span>
          <span style={{ ...styles.monthArrow, transform: showPopup ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>
      </div>

      {/* ── 스크롤 영역 ──────────────────────────────────────── */}
      <div style={styles.scrollArea}>
        {!loaded || !hasTrips ? (
          <EmptyState />
        ) : (
          <div style={styles.listWrapper}>
            {trips.map((day) => (
              <DayGroupItem key={day.date} day={day} />
            ))}
          </div>
        )}
      </div>

      {/* ── 연월 선택 모달 ───────────────────────────────────── */}
      {showPopup && (
        <div style={styles.overlay} onClick={onClosePopup}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              <span style={styles.popupTitle}>조회연월 선택</span>
              <span style={styles.popupClose} onClick={onClosePopup}>∧</span>
            </div>
            <div style={styles.popupList}>
              {monthOptions.map((m) => (
                <div
                  key={m}
                  style={{
                    ...styles.popupItem,
                    ...(m === selectedMonth ? styles.popupItemSelected : {}),
                  }}
                  onClick={() => onSelectMonth(m)}
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
  fixedHeader: {
    flexShrink: 0,
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    backgroundColor: '#f5f5f7',
  },
  userBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px 8px',
  },
  userLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: { width: '32px', height: '32px', objectFit: 'contain' as const },
  userName: { fontSize: '18px', fontWeight: '700', color: '#111111' },
  vehicleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 16px 8px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '30px',
    border: '1.5px solid #2b5cff',
  },
  megaphoneIcon: { width: '20px', height: '20px', objectFit: 'contain' as const },
  divider: { width: '1px', height: '14px', backgroundColor: '#d1d5db', flexShrink: 0 },
  vehicleBadge: { fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap' as const },
  vehicleInfo: { fontSize: '14px', color: '#444444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  scrollArea: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' },
  statsBox: {
    display: 'flex',
    backgroundColor: '#ffffff',
    margin: '16px 16px 8px',
    padding: '14px 0',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statDivider: { width: '1px', backgroundColor: '#eeeeee', margin: '4px 0' },
  statLabel: { fontSize: '11px', color: '#888888' },
  statValue: { fontSize: '17px', fontWeight: '700', color: '#111111' },
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
  monthSelectorText: { fontSize: '14px', fontWeight: '600', color: '#222222' },
  monthArrow: { fontSize: '11px', color: '#888888', transition: 'transform 0.2s' },
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
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
  popupTitle: { fontSize: '14px', fontWeight: '600', color: '#333333' },
  popupClose: { fontSize: '16px', color: '#888888', cursor: 'pointer' },
  popupList: { maxHeight: '240px', overflowY: 'auto' as const },
  popupItem: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#333333',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
  },
  popupItemSelected: { backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '600' },
  emptyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '60px',
    gap: '16px',
  },
  emptyImage: { width: '130px', height: '130px', objectFit: 'contain' },
  emptyText: { fontSize: '14px', color: '#888888', margin: 0 },
  listWrapper: { display: 'flex', flexDirection: 'column', padding: '8px 0' },
  dayGroup: { marginBottom: '8px' },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px 6px',
  },
  dayDate: { fontSize: '13px', fontWeight: '600', color: '#333333' },
  dayCount: { fontSize: '11px', color: '#aaaaaa' },
  timeline: { padding: '0 16px' },
  timelineRow: { display: 'flex', gap: '10px' },
  timelineDotCol: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '12px',
    flexShrink: 0,
    alignSelf: 'stretch' as const,
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
    top: 'calc(50% + 5px)',
    bottom: 'calc(-50% - 8px)',
    left: '5px',
    width: '2px',
    backgroundColor: '#e2e8f0',
    zIndex: 0,
  },
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
  tripTime: { fontSize: '13px', fontWeight: '600', color: '#222222' },
  tripDistance: { display: 'flex', alignItems: 'baseline' },
  tripDistanceNum: { fontSize: '18px', fontWeight: '700', color: '#10b981' },
  tripDistanceUnit: { fontSize: '12px', color: '#10b981', marginLeft: '2px' },
  tripBottom: { fontSize: '12px', color: '#888888' },
};
