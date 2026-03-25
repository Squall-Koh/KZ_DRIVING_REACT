import React from 'react';
import { type DayRecord } from './useAttendance';
import type { UseAttendanceDetailReturn } from './useAttendanceDetail';

function BadgeItem({ color, value }: { color: string; value: number }) {
  return (
    <div style={styles.badgeItem}>
      <span style={{ ...styles.colorBox, backgroundColor: color }} />
      <span style={styles.badgeValue}>{Math.floor(value)}h</span>
    </div>
  );
}

function DayCard({ day }: { day: DayRecord }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardRow}>
        <div style={styles.cardLeft}>
          <span style={styles.dateText}>{day.dateLabel}</span>
          <span style={styles.timeText}>출근 : {day.checkIn} ~ 퇴근 {day.checkOut}</span>
          <span style={styles.totalText}>총 근무시간 : {Math.floor(day.regularH + day.overtimeH + day.nightH)}시간</span>
        </div>
        <div style={styles.cardRight}>
          <BadgeItem color="#3b82f6" value={day.regularH}  />
          <BadgeItem color="#22c55e" value={day.overtimeH} />
          <BadgeItem color="#f59e0b" value={day.nightH}    />
        </div>
      </div>
    </div>
  );
}

export function AttendanceDetailView({ days, weekLabel, headerParts, month, onBack }: UseAttendanceDetailReturn) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>‹</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={styles.title}>근무내역 상세보기</span>
          {headerParts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
              <span style={styles.subTitle}>{headerParts[0]}</span>
              <span style={styles.subTitleSub}>~ {headerParts[1]}</span>
            </div>
          )}
          {!weekLabel && <span style={styles.subTitle}>{month} 전체</span>}
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div style={styles.list}>
        {days.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', padding: 40, fontSize: 14 }}>
            해당 기간의 근무 내역이 없습니다.
          </div>
        )}
        {days.map((d, i) => <DayCard key={i} day={d} />)}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f7', fontFamily: "'Pretendard','Noto Sans KR',sans-serif", overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#fff', borderBottom: '1px solid #eee', flexShrink: 0 },
  backBtn: { fontSize: 24, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  title: { fontSize: 15, fontWeight: 700, color: '#111' },
  subTitle: { fontSize: 11, fontWeight: 600, color: '#4D7EFF', marginTop: 2 },
  subTitleSub: { fontSize: 10, color: '#999' },
  list: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardLeft: { display: 'flex', flexDirection: 'column', gap: 5, flex: 1 },
  dateText: { fontSize: 13, fontWeight: 700, color: '#4D7EFF' },
  timeText: { fontSize: 13, color: '#333' },
  totalText: { fontSize: 13, fontWeight: 600, color: '#111' },
  cardRight: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', minWidth: 60, flexShrink: 0 },
  badgeItem: { display: 'flex', alignItems: 'center', gap: 5 },
  colorBox: { width: 12, height: 12, borderRadius: 3, flexShrink: 0 },
  badgeValue: { fontSize: 13, fontWeight: 600, color: '#333', minWidth: 36, textAlign: 'right' as const },
};
