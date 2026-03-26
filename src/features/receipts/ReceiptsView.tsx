import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { DateRangePicker } from '../../components/DateRangePicker';
import { SelectDropdown } from '../../components/SelectDropdown';
import type { UseReceiptsReturn } from './useReceipts';

export function ReceiptsView({
  expenseStatus,
  receiptsToProcess,
  corporateCards,
  personalCards,
  corporateReceipts,
  personalReceipts,
  recentExpenses,
  scrollRef,
  onNavigate,
  showDatePicker,
  startDate,
  endDate,
  onCloseDatePicker,
  onConfirmDateRange,
  isManualPopupOpen,
  onOpenManualPopup,
  onCloseManualPopup,
  onOpenDatePicker,
}: UseReceiptsReturn) {
  return (
    <div style={styles.container}>
      {/* ── 고정 영역 (경비 현황) ─────────────────────────────────── */}
      <div style={styles.fixedHeader}>

        {/* ── 경비 현황 (고정) ─────────────────────────────────── */}
        <div style={styles.expenseStatusCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>경비현황</span>
            <svg onClick={onOpenDatePicker} style={{ cursor: 'pointer' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div style={styles.expenseRow}>
            <span style={styles.expensePeriod}>{expenseStatus.period}</span>
            <div style={styles.expenseAmountWrapper}>
              <span style={styles.expenseAmount}>{expenseStatus.totalAmount.toLocaleString()}</span>
              <span style={styles.expenseUnit}>원</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 스크롤 영역 ──────────────────────────────────────── */}
      <div style={styles.scrollArea} ref={scrollRef}>

        {/* ── 처리할 영수증 ──────────────────────────────────── */}
        <div style={styles.sectionGroup}>
          <div style={styles.sectionHeader}>처리할 영수증</div>
          
          <button style={styles.listItem} onClick={() => onNavigate('/receipts/list', { 
            tab: 'corporate', 
            corporateReceipts, 
            personalReceipts, 
            corporateCards, 
            personalCards 
          })}>
            <span style={styles.listLabel}>법인카드</span>
            <div style={styles.listRight}>
              <span style={styles.countBadge}>{receiptsToProcess.corporateCount} 건</span>
              <ChevronRight size={20} color="#999" style={styles.listArrow} />
            </div>
          </button>
          
          <button style={styles.listItem} onClick={() => onNavigate('/receipts/list', { 
            tab: 'personal', 
            corporateReceipts, 
            personalReceipts, 
            corporateCards, 
            personalCards 
          })}>
            <span style={styles.listLabel}>개인카드</span>
            <div style={styles.listRight}>
              <span style={{...styles.countBadge, color: '#ef4444', backgroundColor: '#fee2e2'}}>{receiptsToProcess.personalCount} 건</span>
              <ChevronRight size={20} color="#999" style={styles.listArrow} />
            </div>
          </button>

          <div style={styles.buttonWrapper}>
            <button style={styles.primaryButton} onClick={onOpenManualPopup}>
              + 미등록카드 경비등록
            </button>
          </div>
        </div>

        {/* ── 최근 경비 내역 ────────────────────────────────── */}
        <div style={styles.sectionGroup}>
          <div style={{ ...styles.sectionHeader, borderBottom: 'none' }}>
            <span>최근경비 내역</span>
            {/* 더보기 버튼 활성화 및 이동 */}
            <button style={styles.moreButton} onClick={() => onNavigate('/receipts/history', { recentExpenses, startDate, endDate })}>더보기</button>
          </div>
          
          <div style={styles.historyList}>
            {recentExpenses.map((item, index) => (
              <div key={item.id} style={{ ...styles.historyItem, borderBottom: index < recentExpenses.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={styles.historyLeft}>
                  <span style={styles.historyDate}>{item.date}</span>
                  <span style={styles.historyStore}>{item.store}</span>
                </div>
                <div style={styles.historyRight}>
                  <span style={styles.historyAmount}>{item.amount.toLocaleString()}</span>
                  <span style={styles.historyAmountUnit}>원</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showDatePicker && (
        <DateRangePicker
          initialStart={startDate}
          initialEnd={endDate}
          onConfirm={onConfirmDateRange}
          onCancel={onCloseDatePicker}
        />
      )}

      {/* 미등록카드 수기 등록 팝업 */}
      {isManualPopupOpen && (
        <ManualReceiptPopup onClose={onCloseManualPopup} />
      )}
    </div>
  );
}

// ─── 미등록카드 경비등록 수기 팝업 컴포넌트 ─────────────────────
function ManualReceiptPopup({ onClose }: { onClose: () => void }) {
  const [purpose, setPurpose] = useState('');
  const [slipType, setSlipType] = useState('purchase');
  const [attachedFiles, setAttachedFiles] = useState<{name: string; base64: string}[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const purposeOptions = [
    { label: '수행기사 식대 결제', value: 'meal' },
    { label: '수행차량 주유비 결제', value: 'fuel' },
    { label: '수행차량 비품 구매', value: 'supplies' },
    { label: '수행차량 경·정비 결제', value: 'maintenance' },
    { label: '수행차량 주차비 결제', value: 'parking' },
    { label: '기타지출', value: 'other' },
  ];

  const slipOptions = [
    { label: '매입전표', value: 'purchase' },
    { label: '기타전표', value: 'other' },
  ];

  useEffect(() => {
    (window as any).onImageAttached = (name: string, base64: string) => {
      setAttachedFiles(prev => [...prev, { name, base64 }]);
    };
    return () => {
      delete (window as any).onImageAttached;
    };
  }, []);

  return (
    <div style={ms.popupOverlay}>
      <div style={ms.popupContainer}>
        {/* 헤더 */}
        <div style={ms.popupHeader}>
          <div style={ms.popupHeaderEmpty} />
          <span style={ms.popupTitle}>영수증 등록</span>
          <button style={ms.popupCloseBtn} onClick={onClose}>✕</button>
        </div>
        
        {/* 스크롤 콘텐츠 */}
        <div style={ms.popupScroll}>
          {/* 거래일자 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>거래일자 <span style={ms.required}>*</span></label>
            <input style={ms.input} defaultValue="2026-03-01" />
          </div>

          {/* 가맹점명 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>가맹점명 <span style={ms.required}>*</span></label>
            <input style={ms.input} defaultValue="그랑서울 카센터" />
          </div>

          {/* 거래금액 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>거래금액 <span style={ms.required}>*</span></label>
            <input style={ms.input} defaultValue="130,000원" />
          </div>

          {/* 가맹점주소 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>가맹점주소 <span style={ms.required}>*</span></label>
            <input style={ms.input} defaultValue="서울특별시 종로구 종로33" />
          </div>

          {/* 지출증빙 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>지출증빙 <span style={ms.required}>*</span></label>
            <div style={ms.inputDisabled}>개인카드</div>
          </div>

          {/* 사용목적 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>사용목적 <span style={ms.required}>*</span></label>
            <SelectDropdown
              value={purpose}
              onChange={setPurpose}
              options={purposeOptions}
              placeholder="사용목적을 선택하세요."
              headerLabel="사용목적 선택"
            />
          </div>

          {/* 전표구분 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>전표구분 <span style={ms.required}>*</span></label>
            <SelectDropdown
              value={slipType}
              onChange={setSlipType}
              options={slipOptions}
              placeholder="전표구분을 선택하세요."
              headerLabel="전표구분 선택"
            />
          </div>

          {/* 첨부파일 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>첨부파일</label>
            <button 
              style={ms.attachBtn}
              onClick={() => {
                if ((window as any).FlutterBridge) {
                  (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'requestImageAttachment' }));
                } else {
                  alert('모바일 앱 환경에서만 사진 첨부가 가능합니다.');
                }
              }}
            >
              첨부파일 추가 <span style={ms.attachPlus}>+</span>
            </button>
            {attachedFiles.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {attachedFiles.map((f, idx) => {
                  const sizeBytes = Math.floor(f.base64.length * 0.75);
                  let adjusted = sizeBytes;
                  if (f.base64.endsWith('==')) adjusted -= 2;
                  else if (f.base64.endsWith('=')) adjusted -= 1;
                  const sizeKb = Math.floor(adjusted / 1024);

                  return (
                    <div key={idx} style={ms.attachedFileItem}>
                      <img src={f.base64} alt="thumb" style={ms.attachedFileThumb} />
                      <span style={ms.attachedFileName}>{f.name} <span style={{ color: '#888' }}>({sizeKb}KB)</span></span>
                      <button 
                        style={ms.attachedFileRemove}
                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                      >✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={ms.instructionText}>
            실제 영수증 정보와 불일치하는 정보는 직접 수정해주세요.
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={ms.popupBottom}>
          <button style={ms.submitBtn} onClick={() => setIsConfirmOpen(true)}>
            경비내역 등록
          </button>
        </div>
      </div>

      {/* 등록 확인 커스텀 모달 다이얼로그 */}
      {isConfirmOpen && (
        <div style={ms.modalOverlay}>
          <div style={ms.modalContent}>
            <div style={ms.modalTitle}>경비내역 등록</div>
            <div style={ms.modalMessage}>작성하신 내역으로 경비를 등록하시겠습니까?</div>
            <div style={ms.modalActionsList}>
              <button style={ms.modalCancelBtn} onClick={() => setIsConfirmOpen(false)}>취소</button>
              <button style={ms.modalConfirmBtn} onClick={() => {}}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', fontFamily: "'Pretendard','Noto Sans KR',sans-serif", overflow: 'hidden' },
  fixedHeader: { flexShrink: 0, position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#fff', borderBottom: '1px solid #eee' },
  userBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' },
  userLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { width: 'auto', height: 'auto', objectFit: 'contain' as const },
  userName: { fontSize: 18, fontWeight: 700, color: '#111' },
  vehicleBar: { display: 'flex', alignItems: 'center', gap: 8, margin: '0 16px 8px', padding: '8px 16px', backgroundColor: '#fff', borderRadius: 30, border: '1.5px solid #2b5cff' },
  megaphoneIcon: { width: 20, height: 20, objectFit: 'contain' as const },
  divider: { width: '1px', height: '14px', backgroundColor: '#d1d5db', flexShrink: 0 },
  vehicleBadge: { fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' as const },
  vehicleInfo: { fontSize: 14, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  
  // Expense Status Card
  expenseStatusCard: { margin: '16px 16px 8px', padding: '20px 16px', backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f1f3f5', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#111' },
  expenseRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  expensePeriod: { fontSize: 13, color: '#888' },
  expenseAmountWrapper: { display: 'flex', alignItems: 'baseline', gap: 4 },
  expenseAmount: { fontSize: 24, fontWeight: 700, color: '#111' },
  expenseUnit: { fontSize: 14, fontWeight: 600, color: '#111' },

  scrollArea: { flex: 1, overflowY: 'auto' as const, display: 'block', paddingBottom: 32 },
  
  // Section Group
  sectionGroup: { backgroundColor: '#fff', borderRadius: 12, margin: '8px 16px 16px', overflow: 'hidden', border: '1px solid #f1f3f5', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px 16px', fontSize: 15, fontWeight: 700, color: '#111' },
  
  // List Item for Receipts Process
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px', width: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' },
  listLabel: { fontSize: 15, color: '#222', fontWeight: 500 },
  listRight: { display: 'flex', alignItems: 'center', gap: 8 },
  countBadge: { fontSize: 13, fontWeight: 600, color: '#ef4444', backgroundColor: '#fee2e2', padding: '4px 10px', borderRadius: 16 },
  listArrow: { fontSize: 20, color: '#aaa', marginTop: -2 },
  
  buttonWrapper: { padding: '16px' },
  primaryButton: { width: '100%', padding: '14px 0', backgroundColor: '#4f7cff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },

  // History List
  moreButton: { fontSize: 13, color: '#aaa', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 },
  historyList: { display: 'flex', flexDirection: 'column', padding: '0 16px 16px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' },
  historyLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' },
  historyDate: { fontSize: 14, color: '#aaa', flexShrink: 0 },
  historyStore: { fontSize: 15, color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  historyRight: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  historyAmount: { fontSize: 15, fontWeight: 700, color: '#111' },
  historyAmountUnit: { fontSize: 14, color: '#111' },
};

// ─── 팝업 스타일 ──────────────────────────────────────────────────
const ms: Record<string, React.CSSProperties> = {
  popupOverlay: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', flexDirection: 'column',
    padding: '56px 0 0 0',
  },
  popupContainer: {
    flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff',
    margin: 0, borderRadius: 0, overflow: 'hidden',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
  },
  popupHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px', borderBottom: '1px dashed #e2e8f0', flexShrink: 0, backgroundColor: '#fff',
  },
  popupHeaderEmpty: { width: 24 },
  popupTitle: { fontSize: 16, fontWeight: 700, color: '#111' },
  popupCloseBtn: { 
    width: 24, height: 24, fontSize: 20, color: '#64748b', 
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
  },
  popupScroll: {
    flex: 1, overflowY: 'auto' as const, padding: '24px 20px', display: 'flex', flexDirection: 'column',
    backgroundColor: '#fff', gap: 20,
  },
  formGroup: { display: 'flex', flexDirection: 'column' },
  formLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  required: { color: '#ef4444' },
  input: {
    padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', color: '#111', fontSize: 15, width: '100%', boxSizing: 'border-box' as const
  },
  inputDisabled: {
    backgroundColor: '#f8fafc', padding: '12px', borderRadius: 8, border: '1px solid #f1f5f9', color: '#64748b', fontSize: 15, width: '100%', boxSizing: 'border-box' as const
  },
  selectWrapper: { position: 'relative' as const },
  select: {
    padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', color: '#8e8e93', fontSize: 15, width: '100%', boxSizing: 'border-box' as const,
  },
  attachBtn: {
    padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8, border: 'none', color: '#333', fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, width: '100%'
  },
  attachPlus: { color: '#4f7cff', fontWeight: 'bold' },
  attachedFileItem: {
    display: 'flex', alignItems: 'center', padding: '8px 12px',
    backgroundColor: '#eff6ff', borderRadius: 6, gap: 8
  },
  attachedFileThumb: {
    width: 36, height: 36, borderRadius: 4, objectFit: 'cover' as const, flexShrink: 0, border: '1px solid #d1d5db'
  },
  attachedFileName: { flex: 1, fontSize: 13, color: '#4f7cff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  attachedFileRemove: { 
    background: 'none', border: 'none', color: '#94a3b8', fontSize: 14, cursor: 'pointer', padding: '0 4px'
  },
  instructionText: { fontSize: 12, color: '#8e8e93', textAlign: 'center' as const, margin: '8px 0 20px' },
  popupBottom: { padding: '16px 20px 24px', flexShrink: 0, backgroundColor: '#fff' },
  submitBtn: {
    width: '100%', padding: '16px', backgroundColor: '#4f7cff', color: '#fff', fontSize: 16, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer'
  },

  // 팝업 모달
  modalOverlay: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
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
