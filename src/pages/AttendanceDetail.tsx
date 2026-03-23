import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';

// ─── 타입 ──────────────────────────────────────────────────
interface DayRecord {
  date: string;        // "26.03.01"
  checkIn: string;     // "07:30"
  checkOut: string;    // "17:30"
  regularH: number;
  overtimeH: number;
  nightH: number;
}

// ─── 더미 일별 데이터 (월별) ───────────────────────────────
const DUMMY_DAYS: Record<string, DayRecord[]> = {
  '2026.03': [
    { date: '26.03.01', checkIn: '07:30', checkOut: '17:30', regularH: 8,   overtimeH: 2, nightH: 0 },
    { date: '26.03.02', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 0 },
    { date: '26.03.03', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 0 },
    { date: '26.03.04', checkIn: '05:00', checkOut: '20:00', regularH: 8,   overtimeH: 2, nightH: 5 },
    { date: '26.03.05', checkIn: '13:30', checkOut: '17:30', regularH: 4,   overtimeH: 0, nightH: 0 },
    { date: '26.03.06', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 0 },
    { date: '26.03.07', checkIn: '07:00', checkOut: '19:00', regularH: 8,   overtimeH: 3, nightH: 1 },
    { date: '26.03.09', checkIn: '08:30', checkOut: '18:30', regularH: 8,   overtimeH: 2, nightH: 0 },
    { date: '26.03.10', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 0 },
    { date: '26.03.11', checkIn: '22:00', checkOut: '06:00', regularH: 8,   overtimeH: 0, nightH: 8 },
  ],
  '2026.02': [
    { date: '26.02.01', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 0 },
    { date: '26.02.02', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 0 },
    { date: '26.02.03', checkIn: '08:30', checkOut: '20:00', regularH: 8,   overtimeH: 3, nightH: 0 },
    { date: '26.02.04', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 2 },
    { date: '26.02.05', checkIn: '08:30', checkOut: '17:30', regularH: 7,   overtimeH: 0, nightH: 0 },
  ],
  '2026.01': [
    { date: '26.01.02', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 0 },
    { date: '26.01.03', checkIn: '08:30', checkOut: '19:30', regularH: 8,   overtimeH: 2, nightH: 0 },
    { date: '26.01.04', checkIn: '08:30', checkOut: '17:30', regularH: 8,   overtimeH: 0, nightH: 1 },
  ],
};

// ─── BadgeItem: 컬러 박스 + 값 텍스트 ───────────────────────
function BadgeItem({ color, value }: { color: string; value: number }) {
  return (
    <div style={styles.badgeItem}>
      <span style={{ ...styles.colorBox, backgroundColor: color }} />
      <span style={styles.badgeValue}>{value}h</span>
    </div>
  );
}

export function AttendanceDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const month: string = (location.state as any)?.month ?? '2026.03';
  const days = DUMMY_DAYS[month] ?? [];

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>‹</button>
        <span style={styles.title}>근무내역 상세보기</span>
        <div style={{ width: 32 }} />
      </div>

      {/* 리스트 */}
      <div style={styles.list}>
        {days.map((d, i) => (
          <div key={i} style={styles.card}>
            {/* 카드 레이아웃: 좌(날짜+시간) | 우(뱃지 세로) */}
            <div style={styles.cardRow}>

              {/* ── 좌측 ── */}
              <div style={styles.cardLeft}>
                <span style={styles.dateText}>{d.date}</span>
                <span style={styles.timeText}>출근 : {d.checkIn} ~ 퇴근 {d.checkOut}</span>
                <span style={styles.totalText}>총 근무시간 : {d.regularH + d.overtimeH + d.nightH}시간</span>
              </div>

              {/* ── 우측: colored box + 값, 세로 배치 ── */}
              <div style={styles.cardRight}>
                <BadgeItem color="#4f7cff" value={d.regularH} />
                <BadgeItem color="#22c55e" value={d.overtimeH} />
                <BadgeItem color="#f59e0b" value={d.nightH} />
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#f5f5f7', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', backgroundColor: '#fff',
    borderBottom: '1px solid #eee', flexShrink: 0,
  },
  backBtn: {
    fontSize: 24, color: '#333', background: 'none', border: 'none',
    cursor: 'pointer', padding: '0 4px', lineHeight: 1,
  },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },

  list: {
    flex: 1, overflowY: 'auto' as const,
    padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },

  /* 카드 내부: 좌우 분리 */
  cardRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  cardLeft: {
    display: 'flex', flexDirection: 'column', gap: 5, flex: 1,
  },
  dateText:  { fontSize: 13, fontWeight: 700, color: '#4D7EFF' },
  timeText:  { fontSize: 13, color: '#333' },
  totalText: { fontSize: 13, fontWeight: 600, color: '#111' },

  /* 우측 배지 컬럼 — 세로 배치, 100h 폭 확보 */
  cardRight: {
    display: 'flex', flexDirection: 'column', gap: 4,
    alignItems: 'flex-end',
    minWidth: 60,   // "■ 100h" 가 잘리지 않는 폭
  },
  badgeItem: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  colorBox: {
    display: 'inline-block', width: 14, height: 14,
    borderRadius: 3, flexShrink: 0,
  },
  badgeValue: {
    fontSize: 13, fontWeight: 600, color: '#222',
    minWidth: 36, textAlign: 'right' as const, // 100h까지 우측 정렬
  },
};
