import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Briefcase, LogIn, LogOut, Timer, MapPin, Flag } from 'lucide-react';
import type { UseDailyTripHistoryReturn } from './useDailyTripHistory';

// ─── View (순수 UI) ──────────────────────────────────────────
export function DailyTripHistoryView({
  formattedDate,
  currentDate,
  attendance,
  trips,
  handlePrevDay,
  handleNextDay,
  handleDateSelect,
}: UseDailyTripHistoryReturn) {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* ── 헤더 ── */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#111" />
        </button>
        <span style={styles.headerTitle}>일일근태 · 운행기록</span>
        <div style={{ width: 40 }} />
      </div>

      {/* ── 날짜 선택 바 ── */}
      <div style={styles.dateBarOuter}>
        <div style={styles.dateBar}>
          <button style={styles.dateBtn} onClick={handlePrevDay}>
            <ChevronLeft size={24} color="#2B5CFF" />
          </button>
          
          <div style={styles.dateCenter}>
            <span style={styles.dateText}>{formattedDate}</span>
            <Calendar size={18} color="#2B5CFF" style={{ marginLeft: 6 }} />
            <input 
              type="date"
              value={`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  handleDateSelect(new Date(e.target.value));
                }
              }}
              style={styles.dateInputOverlay}
            />
          </div>

          <button style={styles.dateBtn} onClick={handleNextDay}>
            <ChevronRight size={24} color="#2B5CFF" />
          </button>
        </div>
      </div>

      {/* ── 스크롤 콘텐츠 ── */}
      <div style={styles.content}>

        {/* 출퇴근 섹션 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={20} color="#2B5CFF" />
              <span style={styles.cardTitle}>출퇴근</span>
            </div>
            <div style={{
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: attendance.status === '퇴근 완료' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(43, 92, 255, 0.1)',
              color: attendance.status === '퇴근 완료' ? '#22c55e' : '#2B5CFF',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              {attendance.status}
            </div>
          </div>
          <div style={styles.divider} />

          <div style={styles.infoGrid}>
            <div style={{ ...styles.infoBox, backgroundColor: 'rgba(43, 92, 255, 0.05)' }}>
              <div style={styles.infoLabel}>
                <LogIn size={14} color="#2B5CFF" />
                <span style={{ color: '#2B5CFF' }}>출근</span>
              </div>
              <span style={styles.infoValue}>{attendance.checkIn}</span>
            </div>
            <div style={{ ...styles.infoBox, backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
              <div style={styles.infoLabel}>
                <LogOut size={14} color="#22c55e" />
                <span style={{ color: '#22c55e' }}>퇴근</span>
              </div>
              <span style={styles.infoValue}>{attendance.checkOut}</span>
            </div>
            <div style={{ ...styles.infoBox, backgroundColor: 'rgba(249, 115, 22, 0.05)' }}>
              <div style={styles.infoLabel}>
                <Timer size={14} color="#f97316" />
                <span style={{ color: '#f97316' }}>근무</span>
              </div>
              <span style={styles.infoValue}>{attendance.workTime}</span>
            </div>
          </div>
        </div>

        {/* 운행기록 섹션 */}
        <div style={styles.tripSectionHeader}>
          <MapPin size={18} color="#2B5CFF" />
          <span style={styles.tripSectionTitle}>운행기록 {trips.length}건</span>
        </div>

        {trips.map((trip, idx) => (
          <div key={trip.id} style={styles.tripCard}>
            <div style={styles.tripHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={styles.tripBadge}>{idx + 1}</div>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>운행</span>
              </div>
              {trip.status === '운행 중' && (
                <div style={styles.drivingBadge}>운행 중</div>
              )}
            </div>
            <div style={styles.divider} />

            <div style={styles.tripBody}>
              <div style={styles.timelineRow}>
                <div style={styles.timelineIcon}><MapPin size={16} color="#2B5CFF" fill="#2B5CFF" /></div>
                <span style={styles.timelineLabel}>출발</span>
                <span style={styles.timelineTime}>{trip.startTime}</span>
              </div>

              <div style={styles.timelineLineWrapper}>
                <div style={styles.timelineLine} />
                <span style={styles.timelineElapsed}>소요 {trip.elapsed}</span>
              </div>

              <div style={styles.timelineRow}>
                <div style={styles.timelineIcon}><Flag size={16} color="#22c55e" fill="#22c55e" /></div>
                <span style={styles.timelineLabel}>도착</span>
                <span style={styles.timelineTime}>{trip.endTime || '--:--'}</span>
              </div>
            </div>

            <div style={styles.tripFooter}>
              <span style={styles.distanceText}>거리 {trip.distance ? `${trip.distance} km` : '--'}</span>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#F5F6FA', fontFamily: "'Pretendard', sans-serif" },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' },
  headerTitle: { fontSize: '17px', fontWeight: 'bold', color: '#111' },
  dateBarOuter: { padding: '16px 16px 0 16px', backgroundColor: '#F5F6FA' },
  dateBar: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', backgroundColor: '#fff', borderRadius: '14px', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  dateBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' },
  dateCenter: { display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' },
  dateInputOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
  dateText: { fontSize: '17px', fontWeight: 'bold', color: '#111' },
  content: { flex: 1, overflowY: 'auto', padding: '16px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: '15px', fontWeight: 'bold', color: '#111' },
  divider: { height: 1, backgroundColor: '#f0f0f0', margin: '16px 0' },
  infoGrid: { display: 'flex', gap: '12px' },
  infoBox: { flex: 1, padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  infoLabel: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold' },
  infoValue: { fontSize: '15px', fontWeight: 'bold', color: '#111' },
  tripSectionHeader: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', marginLeft: '4px' },
  tripSectionTitle: { fontSize: '15px', fontWeight: 'bold', color: '#111' },
  tripCard: { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '12px', overflow: 'hidden' },
  tripHeader: { padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tripBadge: { width: 28, height: 28, borderRadius: '14px', backgroundColor: '#2B5CFF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' },
  drivingBadge: { padding: '4px 8px', borderRadius: '8px', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', fontSize: '11px', fontWeight: 'bold' },
  tripBody: { padding: '0 16px 16px' },
  timelineRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  timelineIcon: { width: 20, display: 'flex', justifyContent: 'center' },
  timelineLabel: { fontSize: '12px', color: '#666', width: '30px' },
  timelineTime: { fontSize: '14px', fontWeight: 'bold', color: '#111' },
  timelineLineWrapper: { display: 'flex', alignItems: 'center', paddingLeft: '9px', margin: '4px 0' },
  timelineLine: { width: 2, height: 24, backgroundColor: '#eee', marginRight: '19px' },
  timelineElapsed: { fontSize: '12px', color: '#888' },
  tripFooter: { backgroundColor: '#F5F6FA', padding: '12px 16px' },
  distanceText: { fontSize: '13px', color: '#666' },
};
