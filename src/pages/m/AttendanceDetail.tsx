import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import { type DayRecord } from '../../data/attendanceDummyData';

// ─── BadgeItem ────────────────────────────────────────────
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
  const state = (location.state as any) ?? {};

  // 상위 화면(Attendance)에서 전달받은 주간 배열(days)만 사용
  const passedDays: DayRecord[] = state.days ?? [];
  const weekLabel: string = state.weekLabel ?? '';
  const month: string     = state.month    ?? '2026.03'; // 하위 호환용 fallback text

  const days: DayRecord[] = passedDays;

  // 헤더 서브 타이틀
  const parts = weekLabel ? weekLabel.split(' ~ ') : [];

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>‹</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={styles.title}>근무내역 상세보기</span>
          {parts.length > 0 && (
            <>
              <span style={styles.subTitle}>{parts[0]}</span>
              <span style={styles.subTitleSub}>~ {parts[1]}</span>
            </>
          )}
          {!weekLabel && <span style={styles.subTitle}>{month} 전체</span>}
        </div>
        <div style={{ width: 32 }} />
      </div>

      {/* 리스트 */}
      <div style={styles.list}>
        {days.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', padding: 40, fontSize: 14 }}>
            해당 기간의 근무 내역이 없습니다.
          </div>
        )}
        {days.map((d, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.cardRow}>
              {/* 좌측 */}
              <div style={styles.cardLeft}>
                <span style={styles.dateText}>{d.dateLabel}</span>
                <span style={styles.timeText}>출근 : {d.checkIn} ~ 퇴근 {d.checkOut}</span>
                <span style={styles.totalText}>총 근무시간 : {d.regularH + d.overtimeH + d.nightH}시간</span>
              </div>
              {/* 우측 — 세로 뱃지 */}
              <div style={styles.cardRight}>
                <BadgeItem color="#3b82f6" value={d.regularH} />
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

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#f5f5f7', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', backgroundColor: '#fff', borderBottom: '1px solid #eee',
    flexShrink: 0,
  },
  backBtn:     { fontSize: 24, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  title:       { fontSize: 15, fontWeight: 700, color: '#111' },
  subTitle:    { fontSize: 11, fontWeight: 600, color: '#4D7EFF', marginTop: 2 },
  subTitleSub: { fontSize: 10, color: '#999' },

  list: {
    flex: 1, overflowY: 'auto' as const,
    display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px',
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardRow:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardLeft:  { display: 'flex', flexDirection: 'column', gap: 5, flex: 1 },
  dateText:  { fontSize: 13, fontWeight: 700, color: '#4D7EFF' },
  timeText:  { fontSize: 13, color: '#333' },
  totalText: { fontSize: 13, fontWeight: 600, color: '#111' },
  cardRight: {
    display: 'flex', flexDirection: 'column', gap: 4,
    alignItems: 'flex-end', minWidth: 60, flexShrink: 0,
  },
  badgeItem: { display: 'flex', alignItems: 'center', gap: 5 },
  colorBox:  { width: 12, height: 12, borderRadius: 3, flexShrink: 0 },
  badgeValue:{ fontSize: 13, fontWeight: 600, color: '#333', minWidth: 36, textAlign: 'right' as const },
};
