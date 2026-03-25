import React, { useState, useRef } from 'react';
import iconCalendar from '../../assets/icon_calendar.png';
import { Clock, RefreshCw, ChevronLeft } from 'lucide-react';
import { ClockTimePicker } from '../../components/ClockTimePicker';
import { DatePicker } from '../../components/DatePicker';
import { usePullToRefresh } from '../notifications/usePullToRefresh';
import type { UseAttendanceAdjustmentReturn, AdjustmentRecord } from './useAttendanceAdjustment';
import { STATUS_STYLE } from './useAttendanceAdjustment';

// ─── 근태조정 신청 탭 ────────────────────────────────────────
function AdjustTab({
  workDate, timeFrom, timeTo, attachedFiles, clockTarget, isConfirmOpen,
  onWorkDateChange, onTimeFromChange, onTimeToChange, onRemoveFile, onRequestAttachment, 
  onClockTargetChange, setIsConfirmOpen, onSubmitConfirm,
}: Pick<UseAttendanceAdjustmentReturn,
  'workDate' | 'timeFrom' | 'timeTo' | 'attachedFiles' | 'clockTarget' | 'isConfirmOpen' |
  'onWorkDateChange' | 'onTimeFromChange' | 'onTimeToChange' | 'onRemoveFile' | 
  'onRequestAttachment' | 'onClockTargetChange' | 'setIsConfirmOpen' | 'onSubmitConfirm'
>) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const displayDate = workDate ? workDate.replace(/-/g, '.') : '';

  return (
    <div style={ts.form}>
      <div style={ts.fieldGroup}>
        <label style={ts.label}>근무일자 <span style={{ color: '#ef4444' }}>*</span></label>
        <div style={ts.inputRow}>
          <input 
            style={ts.input} 
            type="text" 
            readOnly 
            placeholder="조정할 근무일자를 선택해주세요." 
            value={displayDate} 
            onClick={() => setShowDatePicker(true)} 
          />
          <img 
            src={iconCalendar} 
            alt="calendar" 
            style={{ ...ts.iconImg, cursor: 'pointer' }} 
            onClick={() => setShowDatePicker(true)} 
          />
        </div>
      </div>

      <div style={ts.fieldGroup}>
        <label style={ts.label}>조정 근무시간 <span style={{ color: '#ef4444' }}>*</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...ts.inputRow, flex: 1, paddingRight: 12 }}>
            <input style={{ ...ts.input, flex: 1, width: '100%' }} type="text" readOnly value={timeFrom} onClick={() => onClockTargetChange('from')} />
            <Clock size={18} color="#999" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => onClockTargetChange('from')} />
          </div>
          <span style={{ color: '#888', flexShrink: 0 }}>~</span>
          <div style={{ ...ts.inputRow, flex: 1, paddingRight: 12 }}>
            <input style={{ ...ts.input, flex: 1, width: '100%' }} type="text" readOnly value={timeTo} onClick={() => onClockTargetChange('to')} />
            <Clock size={18} color="#999" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => onClockTargetChange('to')} />
          </div>
        </div>
        <p style={ts.hint}>* 변경을 희망하는 출/퇴근 시간을 입력해주세요.</p>
      </div>

      <div style={ts.fieldGroup}>
        <label style={ts.label}>첨부파일 <span style={{ color: '#ef4444' }}>*</span></label>
        <button style={ts.addFileBtn} onClick={onRequestAttachment}>
          첨부파일 추가 <span style={{ color: '#4f7cff', fontWeight: 'bold' }}>+</span>
        </button>
        {attachedFiles.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {attachedFiles.map((f, idx) => (
              <div key={idx} style={ts.attachedFileItem}>
                <img src={f.base64} alt="thumb" style={ts.attachedFileThumb} />
                <span style={ts.attachedFileName}>{f.name} <span style={{ color: '#888' }}>({f.sizeKb}KB)</span></span>
                <button 
                  style={ts.attachedFileRemove}
                  onClick={() => onRemoveFile(idx)}
                >✕</button>
              </div>
            ))}
          </div>
        )}
        <p style={ts.hint}>* 변경될 출/퇴근 시간에 대한 증거자료를 첨부해주세요.</p>
      </div>

      <div style={{ flex: 1 }} />
      <button style={ts.submitBtn} onClick={() => setIsConfirmOpen(true)}>
        근태조정 신청
      </button>

      {/* 팝업 오버레이 */}
      {showDatePicker && (
        <DatePicker
          initialDate={workDate || new Date().toISOString().split('T')[0]}
          onConfirm={(d) => {
            onWorkDateChange(d);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
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
      
      {/* 접수 컨펌 다이얼로그 */}
      {isConfirmOpen && (
        <div style={ts.modalOverlay}>
          <div style={ts.modalContent}>
            <div style={ts.modalTitle}>근태조정 신청</div>
            <div style={ts.modalMessage}>해당 내용으로 근태조정을 신청하시겠습니까?</div>
            <div style={ts.modalActionsList}>
              <button style={ts.modalCancelBtn} onClick={() => setIsConfirmOpen(false)}>취소</button>
              <button style={ts.modalConfirmBtn} onClick={onSubmitConfirm}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 결재현황 탭 ─────────────────────────────────────────────
function ApprovalTab({
  adjustments, loading, hasMore, observerRef, 
  onRefresh, isRefreshing, snackbarMessage
}: {
  adjustments: AdjustmentRecord[];
  loading: boolean;
  hasMore: boolean;
  observerRef: React.RefObject<HTMLDivElement | null>;
  onRefresh: () => void;
  isRefreshing: boolean;
  snackbarMessage: string | null;
}) {
  const [dialogConfig, setDialogConfig] = useState<{type: 'cancel' | 'edit'; id: number} | null>(null);
  const [isFabVisible, setIsFabVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { pullDist, isPullRate, isPulling } = usePullToRefresh(
    scrollRef as React.RefObject<HTMLDivElement>,
    onRefresh,
    isRefreshing
  );

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const handleScroll = () => {
    setIsFabVisible((scrollRef.current?.scrollTop ?? 0) > 100);
  };

  return (
    <>
      {/* 스크롤 가능한 영역 — 알림 화면과 동일하게 자체 관리 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehaviorY: 'none', display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        {/* Pull to Refresh Indicator */}
        <div style={{
          ...ts.ptrIndicator,
          height: `${pullDist}px`,
          opacity: isPullRate,
          transition: isPulling ? 'none' : 'height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={16} color="#888" style={{ transform: `rotate(${isPullRate * 360}deg)` }} />
            <span>
              {isRefreshing ? '데이터를 가져오는 중...' : (pullDist > 50 ? '놓아서 새로고침...' : '아래로 당기세요')}
            </span>
          </div>
        </div>

        <div style={ts.approvalList}>
          {adjustments.map((item) => (
            <div key={item.id} style={ts.approvalCard}>
              <div style={ts.approvalTop}>
                <span style={ts.approvalDate}>{item.submitDate}</span>
                <span style={{ ...ts.statusBadge, ...(STATUS_STYLE[item.status] || {}) }}>
                  {item.status}
                </span>
              </div>
              <div style={ts.approvalTitle}>근태조정 신청서</div>
              <div style={ts.approvalTime}>
                근무일자: {item.workDate} <br/>
                조정시간: {item.timeFrom} ~ {item.timeTo}
              </div>
              
              {item.status === '결재대기' && (
                <div style={ts.approvalActions}>
                  <button style={ts.cancelBtn} onClick={() => setDialogConfig({type: 'cancel', id: item.id})}>등록취소</button>
                  <button style={ts.editBtn} onClick={() => setDialogConfig({type: 'edit', id: item.id})}>수정</button>
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <div ref={observerRef as unknown as React.RefObject<HTMLDivElement>} style={{ height: '20px' }} />
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: 13 }}>
              목록 불러오는 중...
            </div>
          )}
          {!loading && !hasMore && adjustments.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#bbb', fontSize: 13 }}>
              더 이상 내역이 없습니다.
            </div>
          )}
        </div>
      </div>

      {isFabVisible && (
        <button style={ts.fabBtn} onClick={scrollToTop}>↑</button>
      )}

      {dialogConfig && (
        <div style={ts.modalOverlay}>
          <div style={ts.modalContent}>
            <div style={ts.modalTitle}>{dialogConfig.type === 'cancel' ? '등록 취소' : '신청서 수정'}</div>
            <div style={ts.modalMessage}>해당 내용을 {dialogConfig.type === 'cancel' ? '취소' : '수정'}하시겠습니까?</div>
            <div style={ts.modalActionsList}>
              <button style={ts.modalCancelBtn} onClick={() => setDialogConfig(null)}>닫기</button>
              <button style={ts.modalConfirmBtn} onClick={() => setDialogConfig(null)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {snackbarMessage && (
        <div style={ts.snackbar}>{snackbarMessage}</div>
      )}
    </>
  );
}

// ─── View 컴포넌트 (순수 UI) ─────────────────────────────────
export function AttendanceAdjustmentView(props: UseAttendanceAdjustmentReturn) {
  const { tab, onTabChange, onBack } = props;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={28} color="#111" />
        </button>
        <span style={styles.title}>근태조정 신청서 등록</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={styles.tabRow}>
        <button style={{ ...styles.tabBtn, ...(tab === 'adjust' ? styles.tabActive : styles.tabInactive) }} onClick={() => onTabChange('adjust')}>근태조정 신청</button>
        <button style={{ ...styles.tabBtn, ...(tab === 'approval' ? styles.tabActive : styles.tabInactive) }} onClick={() => onTabChange('approval')}>결재현황</button>
      </div>

      <div style={styles.content} ref={props.scrollAreaRef as unknown as React.RefObject<HTMLDivElement>}>
        {tab === 'adjust' ? (
          <AdjustTab
            workDate={props.workDate}
            timeFrom={props.timeFrom}
            timeTo={props.timeTo}
            attachedFiles={props.attachedFiles}
            clockTarget={props.clockTarget}
            isConfirmOpen={props.isConfirmOpen}
            onWorkDateChange={props.onWorkDateChange}
            onTimeFromChange={props.onTimeFromChange}
            onTimeToChange={props.onTimeToChange}
            onRemoveFile={props.onRemoveFile}
            onRequestAttachment={props.onRequestAttachment}
            onClockTargetChange={props.onClockTargetChange}
            setIsConfirmOpen={props.setIsConfirmOpen}
            onSubmitConfirm={props.onSubmitConfirm}
          />
        ) : (
          <ApprovalTab 
            adjustments={props.adjustments} 
            loading={props.loading}
            hasMore={props.hasMore}
            observerRef={props.observerRef}
            onRefresh={props.onRefresh}
            isRefreshing={props.loading && props.adjustments.length > 0}
            snackbarMessage={props.snackbarMessage}
          />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#ffffff', fontFamily: "'Pretendard','Noto Sans KR',sans-serif", overflow: 'hidden', position: 'relative' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: '#fff', borderBottom: '1px solid #eee', flexShrink: 0 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '12px', display: 'flex', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },
  tabRow: { display: 'flex', backgroundColor: '#f1f5f9', margin: '12px 16px', borderRadius: 12, padding: 4, flexShrink: 0 },
  tabBtn: { flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 10, background: 'none' },
  tabActive: { backgroundColor: '#fff', color: '#111', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' },
  tabInactive: { backgroundColor: 'transparent', color: '#8e8e93' },
  content: { flex: 1, overflowY: 'auto', backgroundColor: '#fff', position: 'relative', overscrollBehaviorY: 'none', display: 'flex', flexDirection: 'column', minHeight: 0 },
};

const ts: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', padding: 16, gap: 20, flex: 1 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 700, color: '#222' },
  inputRow: { display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 8, backgroundColor: '#fff', paddingRight: 10, overflow: 'hidden' },
  input: { flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: 14, color: '#333', backgroundColor: 'transparent' },
  iconImg: { width: 18, height: 18, objectFit: 'contain' as const, flexShrink: 0 },
  hint: { fontSize: 11, color: '#2563eb', margin: '2px 0 0' },
  addFileBtn: { 
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
    marginTop: 6, padding: '12px 0', fontSize: 15, fontWeight: 500, border: 'none', 
    borderRadius: 8, backgroundColor: '#f8fafc', color: '#333', cursor: 'pointer' 
  },
  attachedFileItem: {
    display: 'flex', alignItems: 'center', padding: '8px 12px',
    backgroundColor: '#eff6ff', borderRadius: 6, gap: 8
  },
  attachedFileThumb: {
    width: 36, height: 36, borderRadius: 4, objectFit: 'cover' as const, flexShrink: 0, border: '1px solid #d1d5db'
  },
  attachedFileIcon: { fontSize: 14 },
  attachedFileName: { flex: 1, fontSize: 13, color: '#4f7cff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  attachedFileRemove: { 
    background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer', padding: '0 4px'
  },
  submitBtn: { padding: '14px 0', fontSize: 15, fontWeight: 700, backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 8 },
  
  // 결재현황 탭 스타일링
  ptrIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888888', fontSize: '13px', transition: 'height 0.1s ease-out, opacity 0.1s ease-out', overflow: 'hidden', flexShrink: 0 },
  approvalList: { display: 'flex', flexDirection: 'column', padding: 16, gap: 12 },
  approvalCard: { backgroundColor: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', border: '1px solid #f1f3f5' },
  approvalTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  approvalDate: { fontSize: 14, color: '#3b82f6', fontWeight: 500 },
  statusBadge: { fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12 },
  approvalTitle: { fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 },
  approvalTime: { fontSize: 14, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 },
  approvalActions: { display: 'flex', gap: 10 },
  cancelBtn: { flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600, backgroundColor: '#f87171', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' },
  editBtn: { flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600, backgroundColor: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 10, cursor: 'pointer' },

  fabBtn: {
    position: 'fixed' as const, bottom: 24, right: 16, width: 48, height: 48, 
    borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: 24, 
    fontWeight: 'bold', border: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.4)', 
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    zIndex: 50, transition: 'all 0.2s',
  },

  // 1회용 스낵바
  snackbar: {
    position: 'fixed' as const, bottom: 32, left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#333', color: '#fff', padding: '12px 20px', borderRadius: 8,
    fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 100, pointerEvents: 'none' as const, animation: 'fadeInOut 3s ease-in-out',
    minWidth: '200px', textAlign: 'center' as const,
  },

  // 팝업 모달
  modalOverlay: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 320,
    padding: '24px 20px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column',
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 },
  modalMessage: { fontSize: 14, color: '#555', lineHeight: 1.5, marginBottom: 24 },
  modalActionsList: { display: 'flex', gap: 8 },
  modalCancelBtn: {
    flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600,
    backgroundColor: '#f1f1f5', color: '#555', border: 'none', borderRadius: 10, cursor: 'pointer'
  },
  modalConfirmBtn: {
    flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600,
    backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer'
  }
};
