import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconCalendar from '../assets/icon_calendar.png';
import iconClock from '../assets/icon_clock.png';
import { ClockTimePicker } from '../components/ClockTimePicker';
import { useRef } from 'react';

// ─── 더미 결재 데이터 ──────────────────────────────────────
interface AdjustmentRecord {
  id: number;
  submitDate: string;   // "2026.03.01"
  workDate: string;     // "2026.02.28"
  timeFrom: string;
  timeTo: string;
  status: '결재대기' | '결재완료' | '결재반려';
}

const DUMMY_ADJUSTMENTS: AdjustmentRecord[] = [
  { id: 1, submitDate: '2026.03.01', workDate: '2026.02.28', timeFrom: '08:30', timeTo: '17:30', status: '결재대기' },
  { id: 2, submitDate: '2026.02.13', workDate: '2026.02.12', timeFrom: '08:30', timeTo: '17:30', status: '결재완료' },
  { id: 3, submitDate: '2026.01.30', workDate: '2026.01.28', timeFrom: '08:30', timeTo: '17:30', status: '결재반려' },
  { id: 4, submitDate: '2026.01.13', workDate: '2026.01.13', timeFrom: '08:30', timeTo: '17:30', status: '결재완료' },
  { id: 5, submitDate: '2025.12.13', workDate: '2025.12.13', timeFrom: '08:30', timeTo: '17:30', status: '결재완료' },
];

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  '결재대기': { color: '#2563eb', backgroundColor: '#eff6ff' },
  '결재완료': { color: '#16a34a', backgroundColor: '#f0fdf4' },
  '결재반려': { color: '#dc2626', backgroundColor: '#fef2f2' },
};

// ─── Tab 1: 근태조정 신청 ─────────────────────────────────
function AdjustTab() {
  const [workDate, setWorkDate] = useState('');        // "2026-03-01"
  const [timeFrom, setTimeFrom] = useState('08:30');
  const [timeTo,   setTimeTo]   = useState('17:30');
  const [file,     setFile]     = useState('사진_20260301.PNG');

  const dateRef = useRef<HTMLInputElement>(null);

  // 어떤 시간 필드를 편집 중인지: null | 'from' | 'to'
  const [clockTarget, setClockTarget] = useState<'from' | 'to' | null>(null);

  // "2026-03-01" → "2026.03.01"
  const displayDate = workDate ? workDate.replace(/-/g, '.') : '';

  return (
    <div style={tabStyles.form}>

      {/* 근무일자 */}
      <div style={tabStyles.fieldGroup}>
        <label style={tabStyles.label}>근무일자 <span style={{ color: '#ef4444' }}>*</span></label>
        <div style={tabStyles.inputRow}>
          <input
            style={tabStyles.input}
            type="text" readOnly
            placeholder="조정할 근무일자를 선택해주세요."
            value={displayDate}
            onClick={() => dateRef.current?.showPicker()}
          />
          {/* 숨긴 날짜 피커 */}
          <input
            ref={dateRef} type="date"
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            value={workDate}
            onChange={e => setWorkDate(e.target.value)}
          />
          <img
            src={iconCalendar} alt="calendar"
            style={{ ...tabStyles.iconImg, cursor: 'pointer' }}
            onClick={() => dateRef.current?.showPicker()}
          />
        </div>
      </div>

      {/* 조정 근무시간 */}
      <div style={tabStyles.fieldGroup}>
        <label style={tabStyles.label}>조정 근무시간 <span style={{ color: '#ef4444' }}>*</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* 시작 시간 */}
          <div style={{ ...tabStyles.inputRow, flex: 1 }}>
            <input
              style={{ ...tabStyles.input, flex: 1 }}
              type="text" readOnly value={timeFrom}
              onClick={() => setClockTarget('from')}
            />
            <img
              src={iconClock} alt="clock"
              style={{ ...tabStyles.iconImg, cursor: 'pointer' }}
              onClick={() => setClockTarget('from')}
            />
          </div>

          <span style={{ color: '#888', flexShrink: 0 }}>~</span>

          {/* 종료 시간 */}
          <div style={{ ...tabStyles.inputRow, flex: 1 }}>
            <input
              style={{ ...tabStyles.input, flex: 1 }}
              type="text" readOnly value={timeTo}
              onClick={() => setClockTarget('to')}
            />
            <img
              src={iconClock} alt="clock"
              style={{ ...tabStyles.iconImg, cursor: 'pointer' }}
              onClick={() => setClockTarget('to')}
            />
          </div>

        </div>
        <p style={tabStyles.hint}>* 변경을 희망하는 출/퇴근 시간을 입력해주세요.</p>
      </div>

      {/* 첨부파일 */}
      <div style={tabStyles.fieldGroup}>
        <label style={tabStyles.label}>첨부파일 <span style={{ color: '#ef4444' }}>*</span></label>
        <input style={tabStyles.input} value={file} onChange={e => setFile(e.target.value)} />
        <button style={tabStyles.addFileBtn}>첨부파일 추가 +</button>
        <p style={tabStyles.hint}>* 변경될 출/퇴근 시간에 대한 증거자료를 첨부해주세요.</p>
      </div>

      <div style={{ flex: 1 }} />
      <button style={tabStyles.submitBtn}>등록완료</button>

      {/* 시계 TimePicker 모달 */}
      {clockTarget && (
        <ClockTimePicker
          value={clockTarget === 'from' ? timeFrom : timeTo}
          onConfirm={v => {
            if (clockTarget === 'from') setTimeFrom(v);
            else setTimeTo(v);
            setClockTarget(null);
          }}
          onCancel={() => setClockTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Tab 2: 결재현황 ─────────────────────────────────────
function ApprovalTab() {
  const [showCount, setShowCount] = useState(5);

  return (
    <div style={tabStyles.approvalList}>
      {DUMMY_ADJUSTMENTS.slice(0, showCount).map((rec) => (
        <div key={rec.id} style={tabStyles.approvalCard}>
          <div style={tabStyles.approvalTop}>
            <span style={tabStyles.approvalDate}>{rec.submitDate}</span>
            <span style={{ ...tabStyles.statusBadge, ...STATUS_STYLE[rec.status] }}>{rec.status}</span>
          </div>
          <div style={tabStyles.approvalTitle}>
            근태조정 신청서 - <span style={{ color: '#4D7EFF' }}>{rec.workDate}</span>
          </div>
          <div style={tabStyles.approvalTime}>조정 근무시간 : {rec.timeFrom} ~ {rec.timeTo}</div>

          {rec.status === '결재대기' && (
            <div style={tabStyles.approvalActions}>
              <button style={tabStyles.cancelBtn}>등록취소</button>
              <button style={tabStyles.editBtn}>수정</button>
            </div>
          )}
        </div>
      ))}
      {showCount < DUMMY_ADJUSTMENTS.length && (
        <button style={tabStyles.moreBtn} onClick={() => setShowCount(n => n + 5)}>더보기</button>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
export function AttendanceAdjustment() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'adjust' | 'approval'>('adjust');

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/attendance')}>‹</button>
        <span style={styles.title}>근태조정 신청서 등록</span>
        <div style={{ width: 32 }} />
      </div>

      {/* 탭 */}
      <div style={styles.tabRow}>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'adjust' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setTab('adjust')}
        >
          근태조정 신청
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'approval' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setTab('approval')}
        >
          결재현황
        </button>
      </div>

      {/* 콘텐츠 */}
      <div style={styles.content}>
        {tab === 'adjust' ? <AdjustTab /> : <ApprovalTab />}
      </div>
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────
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
  backBtn: { fontSize: 24, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },
  tabRow: {
    display: 'flex',
    backgroundColor: '#ebebf0',
    margin: '12px 16px',
    borderRadius: 12,
    padding: 4,
    flexShrink: 0,
  },
  tabBtn: {
    flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    borderRadius: 10, background: 'none',
  },
  tabActive: {
    backgroundColor: '#fff',
    color: '#111',
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
  },
  tabInactive: {
    backgroundColor: 'transparent',
    color: '#8e8e93',
  },
  content: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' },
};

const tabStyles: Record<string, React.CSSProperties> = {
  /* 신청 폼 */
  form: {
    display: 'flex', flexDirection: 'column', padding: 16, gap: 20, flex: 1,
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 700, color: '#222' },
  inputRow: {
    display: 'flex', alignItems: 'center',
    border: '1px solid #e0e0e0', borderRadius: 8,
    backgroundColor: '#fff', paddingRight: 10, overflow: 'hidden',
  },
  input: {
    flex: 1, border: 'none', outline: 'none', padding: '10px 12px',
    fontSize: 14, color: '#333', backgroundColor: 'transparent',
  },
  iconImg: { width: 18, height: 18, objectFit: 'contain' as const, flexShrink: 0 },
  hint: { fontSize: 11, color: '#2563eb', margin: '2px 0 0' },
  addFileBtn: {
    marginTop: 6, padding: '10px 0', fontSize: 14, fontWeight: 600,
    border: '1px dashed #d0d0d0', borderRadius: 8,
    backgroundColor: '#fff', cursor: 'pointer', color: '#555',
  },
  submitBtn: {
    padding: '14px 0', fontSize: 15, fontWeight: 700,
    backgroundColor: '#3b82f6', color: '#fff',
    border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 8,
  },

  /* 결재현황 */
  approvalList: {
    display: 'flex', flexDirection: 'column', padding: 16, gap: 10,
  },
  approvalCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  approvalTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  approvalDate: { fontSize: 12, color: '#888' },
  statusBadge: {
    fontSize: 11, fontWeight: 700, padding: '3px 8px',
    borderRadius: 10,
  },
  approvalTitle: { fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 },
  approvalTime: { fontSize: 12, color: '#666', marginBottom: 8 },
  approvalActions: { display: 'flex', gap: 8 },
  cancelBtn: {
    flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600,
    backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
  },
  editBtn: {
    flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600,
    backgroundColor: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer',
  },
  moreBtn: {
    padding: '10px 0', fontSize: 13, fontWeight: 600,
    border: '1px solid #e0e0e0', borderRadius: 8,
    backgroundColor: '#fff', cursor: 'pointer', color: '#555',
  },
};
