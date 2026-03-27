import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { DatePicker } from '../../components/DatePicker';
import iconCalendar from '../../assets/icon_calendar.png';
import type {
  ReceiptRecord,
  HistoryRecord,
  UseMaintenanceDetailReturn,
} from './useMaintenanceDetail';

function RegisterTab({
  mainDate,
  finalMileage,
  memo,
  receipts,
  attachedFile,
  onDateChange,
  onFinalMileageChange,
  onMemoChange,
  alertInfo,
  closeAlert,
  onAddReceiptClick,
  isReceiptConfirmOpen,
  setIsReceiptConfirmOpen,
  onConfirmAddReceipt,
  onSubmitRegistrationClick,
  isSubmitConfirmOpen,
  setIsSubmitConfirmOpen,
  onConfirmSubmitRegistration,
  onRemoveFile,
}: {
  mainDate: string;
  finalMileage: string;
  memo: string;
  receipts: ReceiptRecord[];
  attachedFile: { name: string; base64: string } | null;
  onDateChange: (date: string) => void;
  onFinalMileageChange: (mileage: string) => void;
  onMemoChange: (memo: string) => void;
  
  alertInfo: { isOpen: boolean; title: string; message: string };
  closeAlert: () => void;

  onAddReceiptClick: () => void;
  
  isReceiptConfirmOpen: boolean;
  setIsReceiptConfirmOpen: (open: boolean) => void;
  onConfirmAddReceipt: () => void;

  onSubmitRegistrationClick: () => void;
  isSubmitConfirmOpen: boolean;
  setIsSubmitConfirmOpen: (open: boolean) => void;
  onConfirmSubmitRegistration: () => void;

  onRemoveFile: () => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const displayDate = mainDate ? mainDate : '';

  return (
    <div style={ts.form}>
      <div style={ts.fixedTop}>
        <div style={ts.fieldGroup}>
          <label style={ts.label}>정비일자 <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={{...ts.inputRow, cursor: 'pointer'}} onClick={() => setShowDatePicker(true)}>
            <input
              style={{...ts.input, cursor: 'pointer'}}
              type="text"
              readOnly
              placeholder="정비일자를 선택해주세요."
              value={displayDate}
            />
            <img
              src={iconCalendar}
              alt="calendar"
              style={ts.iconImg}
            />
          </div>
        </div>

        <div style={ts.fieldGroup}>
          <label style={ts.label}>최종 주행거리 <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              style={{ ...ts.input, border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', paddingRight: 32, textAlign: 'right', width: '100%', boxSizing: 'border-box' }}
              value={finalMileage}
              onChange={(e) => onFinalMileageChange(e.target.value)}
              placeholder="0"
            />
            <span style={{ position: 'absolute', right: 12, color: '#111', fontSize: 14, fontWeight: 500 }}>km</span>
          </div>
        </div>

        <div style={ts.fieldGroup}>
          <label style={ts.label}>정비 내용 <span style={{ color: '#ef4444' }}>*</span></label>
          <textarea
            style={{ ...ts.input, border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px', resize: 'none', height: 80, boxSizing: 'border-box' }}
            placeholder="정비 내역을 상세히 입력해주세요. (예: 엔진오일 교환 및 필터 교체)"
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
          />
        </div>

        <div style={ts.fieldGroup}>
          <label style={ts.label}>경비내역</label>
          <button style={ts.addBtn} onClick={onAddReceiptClick}>정비 영수증 추가 +</button>
          {attachedFile && (() => {
            const sizeBytes = Math.floor(attachedFile.base64.length * 0.75);
            let adjusted = sizeBytes;
            if (attachedFile.base64.endsWith('==')) adjusted -= 2;
            else if (attachedFile.base64.endsWith('=')) adjusted -= 1;
            const sizeKb = Math.floor(adjusted / 1024);
            return (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: 6, gap: 8 }}>
                  <img src={attachedFile.base64} alt="thumb" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0, border: '1px solid #d1d5db' }} />
                  <span style={{ flex: 1, fontSize: 13, color: '#4f7cff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachedFile.name} <span style={{ color: '#888' }}>({sizeKb}KB)</span>
                  </span>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer', padding: '0 4px' }} onClick={onRemoveFile}>✕</button>
                </div>
              </div>
            );
          })()}
          <p style={ts.hint}>* 차량 정비를 위한 경비가 발생한 경우 경비를 등록해주세요.</p>
        </div>
      </div>

      {showDatePicker && (
        <DatePicker
          initialDate={mainDate}
          onConfirm={(date) => {
            onDateChange(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}

      {attachedFile && (
        <div style={ts.receiptScroll}>
          {receipts.map((r) => (
            <div key={r.id} style={ts.receiptCard}>
              <div style={ts.receiptTop}>
                <span style={ts.receiptDate}>{displayDate}</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={ts.editBtn}>수정</span>
                  <span style={ts.deleteBtn}>삭제</span>
                </div>
              </div>
              <div style={ts.receiptShop}>{r.shopName}</div>
              <div style={ts.receiptInfo}>거래금액 : {r.amount.toLocaleString()}원</div>
              <div style={ts.receiptInfo}>가맹점주소 : {r.address}</div>
            </div>
          ))}
        </div>
      )}

      <div style={ts.submitWrap}>
        <button style={ts.submitBtn} onClick={onSubmitRegistrationClick}>등록완료</button>
      </div>

      {/* 범용 알림 팝업 (버튼 1개) */}
      {alertInfo.isOpen && (
        <div style={ts.modalOverlay}>
          <div style={ts.modalContent}>
            <div style={ts.modalTitle}>{alertInfo.title}</div>
            <div style={ts.modalMessage}>{alertInfo.message}</div>
            <div style={ts.modalActionsList}>
              <button style={ts.modalConfirmBtn} onClick={closeAlert}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 영수증 사진 첨부 확인 팝업 (버튼 2개) */}
      {isReceiptConfirmOpen && (
        <div style={ts.modalOverlay}>
          <div style={ts.modalContent}>
            <div style={ts.modalTitle}>영수증 사진 첨부</div>
            <div style={ts.modalMessage}>
              영수증 사진을 첨부하시겠습니까?
            </div>
            <div style={ts.modalActionsList}>
              <button style={ts.modalCancelBtn} onClick={() => setIsReceiptConfirmOpen(false)}>취소</button>
              <button style={ts.modalConfirmBtn} onClick={onConfirmAddReceipt}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 정비 등록 완료 확인 팝업 */}
      {isSubmitConfirmOpen && (
        <div style={ts.modalOverlay}>
          <div style={ts.modalContent}>
            <div style={ts.modalTitle}>정비 내역 등록</div>
            <div style={ts.modalMessage}>
              작성하신 내용으로 정비 내역을<br/>
              등록하시겠습니까?
            </div>
            <div style={ts.modalActionsList}>
              <button style={ts.modalCancelBtn} onClick={() => setIsSubmitConfirmOpen(false)}>취소</button>
              <button style={ts.modalConfirmBtn} onClick={onConfirmSubmitRegistration}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 정비내역 탭 ─────────────────────────────────────────────
function HistoryTab({ records }: { records: HistoryRecord[] }) {
  return (
    <div style={ts.historyList}>
      {records.length === 0 && (
        <div style={{ textAlign: 'center', color: '#aaa', padding: 40, fontSize: 14 }}>
          정비 내역이 없습니다.
        </div>
      )}
      {records.map((r) => (
        <div key={r.id} style={ts.historyCard}>
          <div style={ts.historyTop}>
            <span style={ts.historyDate}>{r.date}</span>
            <span style={ts.historyKm}>{r.km.toLocaleString()} km</span>
          </div>
          <div style={ts.historyDesc}>{r.description}</div>
          <div style={ts.historyManager}>담당자 : {r.manager}</div>
        </div>
      ))}
    </div>
  );
}

// ─── View 컴포넌트 (순수 UI) ─────────────────────────────────
export function MaintenanceDetailView({
  item,
  tab,
  mainDate,
  finalMileage,
  memo,
  receipts,
  historyRecords,
  attachedFile,
  onTabChange,
  onDateChange,
  onFinalMileageChange,
  onMemoChange,
  
  alertInfo,
  closeAlert,

  onAddReceiptClick,
  isReceiptConfirmOpen,
  setIsReceiptConfirmOpen,
  onConfirmAddReceipt,

  onSubmitRegistrationClick,
  isSubmitConfirmOpen,
  setIsSubmitConfirmOpen,
  onConfirmSubmitRegistration,

  onRemoveFile,
  onBack,
}: UseMaintenanceDetailReturn) {
  return (
    <div style={s.container}>

      {/* 헤더 */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          <ChevronLeft size={28} color="#111" />
        </button>
        <span style={s.title}>정비항목 상세보기</span>
        <div style={{ width: 32 }} />
      </div>

      {/* 탭 */}
      <div style={s.tabRow}>
        <button
          style={{ ...s.tabBtn, ...(tab === 'register' ? s.tabActive : s.tabInactive) }}
          onClick={() => onTabChange('register')}
        >
          정비등록
        </button>
        <button
          style={{ ...s.tabBtn, ...(tab === 'history' ? s.tabActive : s.tabInactive) }}
          onClick={() => onTabChange('history')}
        >
          정비내역
        </button>
      </div>

      {/* 콘텐츠 */}
      <div style={s.content}>
        <div style={s.itemBadge}>
          <span style={s.itemBadgeText}>{item.name}</span>
          <span style={s.itemBadgeSub}>주기 {item.intervalKm.toLocaleString()}km</span>
        </div>
        {tab === 'register' ? (
          <RegisterTab
            mainDate={mainDate}
            finalMileage={finalMileage}
            memo={memo}
            receipts={receipts}
            attachedFile={attachedFile}
            onDateChange={onDateChange}
            onFinalMileageChange={onFinalMileageChange}
            onMemoChange={onMemoChange}
            alertInfo={alertInfo}
            closeAlert={closeAlert}
            onAddReceiptClick={onAddReceiptClick}
            isReceiptConfirmOpen={isReceiptConfirmOpen}
            setIsReceiptConfirmOpen={setIsReceiptConfirmOpen}
            onConfirmAddReceipt={onConfirmAddReceipt}
            onSubmitRegistrationClick={onSubmitRegistrationClick}
            isSubmitConfirmOpen={isSubmitConfirmOpen}
            setIsSubmitConfirmOpen={setIsSubmitConfirmOpen}
            onConfirmSubmitRegistration={onConfirmSubmitRegistration}
            onRemoveFile={onRemoveFile}
          />
        ) : (
          <HistoryTab records={historyRecords} />
        )}
      </div>
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#fff', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', backgroundColor: '#fff', borderBottom: '1px solid #eee', flexShrink: 0,
  },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '12px', display: 'flex', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },
  itemBadge: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
    padding: '3px 16px 1px', flexShrink: 0,
  },
  itemBadgeText: { fontSize: 11, fontWeight: 700, color: '#4f7cff' },
  itemBadgeSub: { fontSize: 11, color: '#9ca3af' },
  tabRow: {
    display: 'flex', backgroundColor: '#f1f5f9',
    margin: '12px 16px', borderRadius: 12, padding: 4, flexShrink: 0,
  },
  tabBtn: {
    flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
    border: 'none', cursor: 'pointer', borderRadius: 10, background: 'none',
    transition: 'all 0.2s',
  },
  tabActive: { backgroundColor: '#fff', color: '#111', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' },
  tabInactive: { backgroundColor: 'transparent', color: '#8e8e93' },
  content: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' },
};

const ts: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
  fixedTop: { display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 16px 8px', flexShrink: 0 },
  receiptScroll: {
    flex: 1, overflowY: 'auto' as const,
    padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 10,
  },
  submitWrap: { flexShrink: 0, padding: '8px 16px 16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 700, color: '#222' },
  inputRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    border: '1px solid #e5e7eb', borderRadius: 10,
    padding: '10px 12px', backgroundColor: '#fff', position: 'relative' as const,
  },
  input: { flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#333', backgroundColor: 'transparent' },
  iconImg: { width: 20, height: 20, flexShrink: 0, objectFit: 'contain' as const },
  hint: { fontSize: 11, color: '#4f7cff', margin: '2px 0 0' },
  addBtn: {
    padding: '12px 0', fontSize: 14, fontWeight: 600, textAlign: 'center' as const,
    backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
    cursor: 'pointer', color: '#555',
  },
  receiptCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px',
    border: '1px solid #f1f3f5', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transition: 'all 0.2s',
  },
  receiptTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  receiptDate: { fontSize: 13, fontWeight: 700, color: '#4D7EFF' },
  editBtn: { fontSize: 13, color: '#555', cursor: 'pointer' },
  deleteBtn: { fontSize: 13, color: '#ef4444', cursor: 'pointer' },
  receiptShop: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 },
  receiptInfo: { fontSize: 13, color: '#555', marginTop: 2 },
  submitBtn: {
    width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700,
    border: 'none', borderRadius: 12, backgroundColor: '#4f7cff', color: '#fff', cursor: 'pointer',
  },
  historyList: { display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px' },
  historyCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px',
    border: '1px solid #f1f3f5', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transition: 'all 0.2s',
  },
  historyTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  historyDate: { fontSize: 13, fontWeight: 700, color: '#4D7EFF' },
  historyKm: { fontSize: 12, color: '#555', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: 20, fontWeight: 600 },
  historyDesc: { fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 },
  historyManager: { fontSize: 13, color: '#666' },

  loadingOverlay: {
    position: 'fixed', inset: 0, zIndex: 2000,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 16,
  },
  loadingSpinner: {
    width: 40, height: 40,
    border: '4px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: { fontSize: 15, fontWeight: 600, color: '#fff' },

  // ─── 팝업 모달 스타일 ───
  modalOverlay: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 320,
    padding: '24px 20px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column', textAlign: 'center' as const
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 },
  modalMessage: { fontSize: 15, color: '#555', lineHeight: 1.5, marginBottom: 24 },
  modalActionsList: { display: 'flex', gap: 8 },
  modalCancelBtn: {
    flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600,
    backgroundColor: '#f1f1f5', color: '#555', border: 'none', borderRadius: 10, cursor: 'pointer'
  },
  modalConfirmBtn: {
    flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600,
    backgroundColor: '#2b5cff', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer'
  }
};
