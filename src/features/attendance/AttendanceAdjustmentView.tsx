import React, { useRef } from 'react';
import iconCalendar from '../../assets/icon_calendar.png';
import iconClock from '../../assets/icon_clock.png';
import { ClockTimePicker } from '../../components/ClockTimePicker';
import type { UseAttendanceAdjustmentReturn } from './useAttendanceAdjustment';
import { STATUS_STYLE } from './useAttendanceAdjustment';

// ─── 근태조정 신청 탭 ────────────────────────────────────────
function AdjustTab({
  workDate, timeFrom, timeTo, file, clockTarget,
  onWorkDateChange, onTimeFromChange, onTimeToChange, onFileChange, onClockTargetChange,
}: Pick<UseAttendanceAdjustmentReturn,
  'workDate' | 'timeFrom' | 'timeTo' | 'file' | 'clockTarget' |
  'onWorkDateChange' | 'onTimeFromChange' | 'onTimeToChange' | 'onFileChange' | 'onClockTargetChange'
>) {
  const dateRef = useRef<HTMLInputElement>(null);
  const displayDate = workDate ? workDate.replace(/-/g, '.') : '';

  return (
    <div style={ts.form}>
      <div style={ts.fieldGroup}>
        <label style={ts.label}>근무일자 <span style={{ color: '#ef4444' }}>*</span></label>
        <div style={ts.inputRow}>
          <input style={ts.input} type="text" readOnly placeholder="조정할 근무일자를 선택해주세요." value={displayDate} onClick={() => dateRef.current?.showPicker()} />
          <input ref={dateRef} type="date" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} value={workDate} onChange={(e) => onWorkDateChange(e.target.value)} />
          <img src={iconCalendar} alt="calendar" style={{ ...ts.iconImg, cursor: 'pointer' }} onClick={() => dateRef.current?.showPicker()} />
        </div>
      </div>

      <div style={ts.fieldGroup}>
        <label style={ts.label}>조정 근무시간 <span style={{ color: '#ef4444' }}>*</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...ts.inputRow, flex: 1 }}>
            <input style={{ ...ts.input, flex: 1 }} type="text" readOnly value={timeFrom} onClick={() => onClockTargetChange('from')} />
            <img src={iconClock} alt="clock" style={{ ...ts.iconImg, cursor: 'pointer' }} onClick={() => onClockTargetChange('from')} />
          </div>
          <span style={{ color: '#888', flexShrink: 0 }}>~</span>
          <div style={{ ...ts.inputRow, flex: 1 }}>
            <input style={{ ...ts.input, flex: 1 }} type="text" readOnly value={timeTo} onClick={() => onClockTargetChange('to')} />
            <img src={iconClock} alt="clock" style={{ ...ts.iconImg, cursor: 'pointer' }} onClick={() => onClockTargetChange('to')} />
          </div>
        </div>
        <p style={ts.hint}>* 변경을 희망하는 출/퇴근 시간을 입력해주세요.</p>
      </div>

      <div style={ts.fieldGroup}>
        <label style={ts.label}>첨부파일 <span style={{ color: '#ef4444' }}>*</span></label>
        <input style={ts.input} value={file} onChange={(e) => onFileChange(e.target.value)} />
        <button style={ts.addFileBtn}>첨부파일 추가 +</button>
        <p style={ts.hint}>* 변경될 출/퇴근 시간에 대한 증거자료를 첨부해주세요.</p>
      </div>

      <div style={{ flex: 1 }} />
      <button style={ts.submitBtn}>등록완료</button>

      {clockTarget && (
        <ClockTimePicker
          value={clockTarget === 'from' ? timeFrom : timeTo}
          onConfirm={(v) => {
            if (clockTarget === 'from') onTimeFromChange(v);
            else onTimeToChange(v);
            onClockTargetChange(null);
          }}
          onCancel={() => onClockTargetChange(null)}
        />
      )}
    </div>
  );
}

// ─── 결재현황 탭 ─────────────────────────────────────────────
function ApprovalTab({
  adjustments, showCount, onShowMore,
}: Pick<UseAttendanceAdjustmentReturn, 'adjustments' | 'showCount' | 'onShowMore'>) {
  return (
    <div style={ts.approvalList}>
      {adjustments.slice(0, showCount).map((rec) => (
        <div key={rec.id} style={ts.approvalCard}>
          <div style={ts.approvalTop}>
            <span style={ts.approvalDate}>{rec.submitDate}</span>
            <span style={{ ...ts.statusBadge, ...STATUS_STYLE[rec.status] }}>{rec.status}</span>
          </div>
          <div style={ts.approvalTitle}>
            근태조정 신청서 - <span style={{ color: '#4D7EFF' }}>{rec.workDate}</span>
          </div>
          <div style={ts.approvalTime}>조정 근무시간 : {rec.timeFrom} ~ {rec.timeTo}</div>
          {rec.status === '결재대기' && (
            <div style={ts.approvalActions}>
              <button style={ts.cancelBtn}>등록취소</button>
              <button style={ts.editBtn}>수정</button>
            </div>
          )}
        </div>
      ))}
      {showCount < adjustments.length && (
        <button style={ts.moreBtn} onClick={onShowMore}>더보기</button>
      )}
    </div>
  );
}

// ─── View 컴포넌트 (순수 UI) ─────────────────────────────────
export function AttendanceAdjustmentView(props: UseAttendanceAdjustmentReturn) {
  const { tab, onTabChange, onBack } = props;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>‹</button>
        <span style={styles.title}>근태조정 신청서 등록</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={styles.tabRow}>
        <button style={{ ...styles.tabBtn, ...(tab === 'adjust' ? styles.tabActive : styles.tabInactive) }} onClick={() => onTabChange('adjust')}>근태조정 신청</button>
        <button style={{ ...styles.tabBtn, ...(tab === 'approval' ? styles.tabActive : styles.tabInactive) }} onClick={() => onTabChange('approval')}>결재현황</button>
      </div>

      <div style={styles.content}>
        {tab === 'adjust' ? (
          <AdjustTab
            workDate={props.workDate}
            timeFrom={props.timeFrom}
            timeTo={props.timeTo}
            file={props.file}
            clockTarget={props.clockTarget}
            onWorkDateChange={props.onWorkDateChange}
            onTimeFromChange={props.onTimeFromChange}
            onTimeToChange={props.onTimeToChange}
            onFileChange={props.onFileChange}
            onClockTargetChange={props.onClockTargetChange}
          />
        ) : (
          <ApprovalTab adjustments={props.adjustments} showCount={props.showCount} onShowMore={props.onShowMore} />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f7', fontFamily: "'Pretendard','Noto Sans KR',sans-serif", overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: '#fff', borderBottom: '1px solid #eee', flexShrink: 0 },
  backBtn: { fontSize: 24, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },
  tabRow: { display: 'flex', backgroundColor: '#ebebf0', margin: '12px 16px', borderRadius: 12, padding: 4, flexShrink: 0 },
  tabBtn: { flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 10, background: 'none' },
  tabActive: { backgroundColor: '#fff', color: '#111', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' },
  tabInactive: { backgroundColor: 'transparent', color: '#8e8e93' },
  content: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' },
};

const ts: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', padding: 16, gap: 20, flex: 1 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 700, color: '#222' },
  inputRow: { display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 8, backgroundColor: '#fff', paddingRight: 10, overflow: 'hidden' },
  input: { flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: 14, color: '#333', backgroundColor: 'transparent' },
  iconImg: { width: 18, height: 18, objectFit: 'contain' as const, flexShrink: 0 },
  hint: { fontSize: 11, color: '#2563eb', margin: '2px 0 0' },
  addFileBtn: { marginTop: 6, padding: '10px 0', fontSize: 14, fontWeight: 600, border: '1px dashed #d0d0d0', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', color: '#555' },
  submitBtn: { padding: '14px 0', fontSize: 15, fontWeight: 700, backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 8 },
  approvalList: { display: 'flex', flexDirection: 'column', padding: 16, gap: 10 },
  approvalCard: { backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  approvalTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  approvalDate: { fontSize: 12, color: '#888' },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10 },
  approvalTitle: { fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 },
  approvalTime: { fontSize: 12, color: '#666', marginBottom: 8 },
  approvalActions: { display: 'flex', gap: 8 },
  cancelBtn: { flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  editBtn: { flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, backgroundColor: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer' },
  moreBtn: { padding: '10px 0', fontSize: 13, fontWeight: 600, border: '1px solid #e0e0e0', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer', color: '#555' },
};
