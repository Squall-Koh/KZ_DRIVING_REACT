import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '../notifications/usePullToRefresh';
import { SelectDropdown } from '../../components/SelectDropdown';
import type { ReceiptItem } from './useReceipts';
import type { UseReceiptsListReturn } from './useReceiptsList';

export function ReceiptsListView({
  tab,
  onTabChange,
  corporateReceipts,
  personalReceipts,
  corporateCards,
  personalCards,
  selectedReceipt,
  purposeOptions,
  slipOptions,
  onSelectReceipt,
  onClosePopup,
  onReceiptSynced,
  onBack,
  loading,
  hasMore,
  isRefreshing,
  scrollRef,
  observerRef,
  onRefresh,
  isFabVisible,
  scrollToTop,
  activeCardIndex,
  setActiveCardIndex,
  filteredReceipts,
}: UseReceiptsListReturn) {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [tab]);

  const { pullDist, isPullRate, isPulling } = usePullToRefresh(
    scrollRef as React.RefObject<HTMLDivElement>,
    onRefresh,
    isRefreshing
  );

  return (
    <div style={s.container}>
      {/* 헤더 */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          <ChevronLeft size={28} color="#111" />
        </button>
        <span style={s.title}>경비 영수증 목록</span>
        <div style={{ width: 32 }} />
      </div>

      {/* 탭 */}
      <div style={s.tabRow}>
        <button
          style={{ ...s.tabBtn, ...(tab === 'corporate' ? s.tabActive : s.tabInactive) }}
          onClick={() => onTabChange('corporate')}
        >
          법인카드
        </button>
        <button
          style={{ ...s.tabBtn, ...(tab === 'personal' ? s.tabActive : s.tabInactive) }}
          onClick={() => onTabChange('personal')}
        >
          개인카드
        </button>
      </div>

      {/* 등록된 정보 배너 (가로 스크롤 캐러셀) */}
      <div style={s.cardCarouselWrapper}>
        <div style={s.cardCarousel} ref={carouselRef} onScroll={(e) => {
          const idx = Math.round(e.currentTarget.scrollLeft / e.currentTarget.offsetWidth);
          setActiveCardIndex(idx);
        }}>
          {(tab === 'corporate' ? corporateCards : personalCards).map((card, idx) => (
             <div key={idx} style={s.cardInfoBanner}>
               <span style={s.cardInfoLabel}>등록된 {tab === 'corporate' ? '법인카드' : '개인카드'}</span>
               <span style={s.cardInfoName}>{card.name}</span>
               <span style={s.cardInfoNumber}>{card.number}</span>
             </div>
          ))}
          {(tab === 'corporate' ? corporateCards : personalCards).length === 0 && (
            <div style={{...s.cardInfoBanner, justifyContent: 'center'}}>
               <span style={s.cardInfoName}>등록된 카드가 없습니다</span>
            </div>
          )}
        </div>
      </div>

      <div style={s.sectionHeader}>
        <div style={s.sectionTitle}>처리할 영수증</div>
        <div style={s.sectionDesc}>
          하단의 {tab === 'corporate' ? '법인' : '개인'}카드 영수증을 선택하여 경비등록을 완료해주세요.
        </div>
      </div>

      <div style={s.scrollArea} ref={scrollRef}>
        <div style={{
          height: `${pullDist}px`,
          minHeight: `${pullDist}px`,
          opacity: isPullRate,
          transition: isPulling ? 'none' : 'height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13 }}>
            <RefreshCw size={16} color="#888" style={{ transform: `rotate(${isPullRate * 360}deg)` }} />
            <span>
              {isRefreshing ? '데이터를 가져오는 중...' : (pullDist > 50 ? '놓아서 새로고침...' : '아래로 당기세요')}
            </span>
          </div>
        </div>

        {/* 영수증 리스트 */}
        <div style={s.listContainer}>
          {filteredReceipts.map((receipt) => (
            <div 
              key={receipt.id} 
              style={s.receiptCard}
              onClick={() => onSelectReceipt(receipt)}
            >
              <div style={s.receiptTop}>
                <span style={s.receiptDate}>{receipt.date}</span>
                <ChevronRight size={20} color="#ccc" style={s.receiptArrow} />
              </div>
              <div style={s.receiptStore}>{receipt.store}</div>
              <div style={s.receiptInfo}>거래금액 : {receipt.amount.toLocaleString()}원</div>
              <div style={s.receiptInfo}>가맹점주소 : {receipt.address}</div>
            </div>
          ))}
          {filteredReceipts.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: '#aaa', padding: 40, fontSize: 14 }}>
              내역이 없습니다.
            </div>
          )}
          {hasMore && (
            <div ref={observerRef as unknown as React.RefObject<HTMLDivElement>} style={{ height: '20px' }} />
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: 13 }}>
              조회 중...
            </div>
          )}
          {!loading && !hasMore && filteredReceipts.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#bbb', fontSize: 13 }}>
              모든 내역을 불러왔습니다.
            </div>
          )}
        </div>
      </div>

      {/* 맨 위로 가기 FAB */}
      {isFabVisible && (
        <button style={s.fabBtn} onClick={scrollToTop}>↑</button>
      )}

      {/* 영수증 등록 팝업 오버레이 */}
      {selectedReceipt && (
        <ReceiptPopup
          receipt={selectedReceipt}
          tab={tab}
          purposeOptions={purposeOptions}
          slipOptions={slipOptions}
          onClose={onClosePopup}
          onSynced={() => onReceiptSynced(selectedReceipt.id)}
        />
      )}
    </div>
  );
}

// ─── 서브 컴포넌트: 영수증 등록 팝업 ──────────────────────────
function ReceiptPopup({
  receipt,
  tab,
  purposeOptions,
  slipOptions,
  onClose,
  onSynced
}: {
  receipt: ReceiptItem;
  tab: string;
  purposeOptions: { label: string; value: string }[];
  slipOptions: { label: string; value: string }[];
  onClose: () => void;
  onSynced?: () => void;
}) {
  const [purpose, setPurpose] = useState('');
  const [slipType, setSlipType] = useState('purchase');
  const [attachedFiles, setAttachedFiles] = useState<{name: string; base64: string}[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string; onCloseCallback?: () => void }>({ isOpen: false, message: '' });

  useEffect(() => {
    (window as any).onImageAttached = (name: string, base64: string) => {
      setAttachedFiles(prev => [...prev, { name, base64 }]);
    };
    return () => {
      delete (window as any).onImageAttached;
    };
  }, []);

  return (
    <div style={s.popupOverlay}>
      <div style={s.popupContainer}>
        <div style={s.popupHeader}>
          <div style={s.popupHeaderEmpty} />
          <span style={s.popupTitle}>영수증 등록</span>
          <button style={s.popupCloseBtn} onClick={onClose}>✕</button>
        </div>
        
        <div style={s.popupScroll}>
          <div style={s.popupReceiptDate}>{receipt.date}</div>
          <div style={s.popupReceiptStore}>{receipt.store}</div>
          <div style={s.popupReceiptAddress}>{receipt.address}</div>
          
          <div style={s.separator} />
          
          <div style={s.amountRow}>
            <span style={s.amountLabel}>승인금액 :</span>
            <span style={s.amountValueTotal}>
              <span style={s.amountNum}>{receipt.amount.toLocaleString()}</span> 원
            </span>
          </div>
          <div style={s.amountRow}>
            <span style={s.amountLabel}>공급금액 :</span>
            <span style={s.amountValue}>
              {Math.floor(receipt.amount / 1.1).toLocaleString()} 원
            </span>
          </div>
          <div style={s.amountRow}>
            <span style={s.amountLabel}>부가세 :</span>
            <span style={s.amountValue}>
              {(receipt.amount - Math.floor(receipt.amount / 1.1)).toLocaleString()} 원
            </span>
          </div>
          
          <div style={{ ...s.separator, margin: '20px 0 24px' }} />
          
          <div style={s.formGroup}>
            <label style={s.formLabel}>지출증빙 <span style={s.required}>*</span></label>
            <div style={s.inputDisabled}>{tab === 'corporate' ? '법인카드' : '개인카드'}</div>
          </div>
          
          <div style={s.formGroup}>
            <label style={s.formLabel}>사용목적 <span style={s.required}>*</span></label>
            <SelectDropdown
              value={purpose}
              onChange={setPurpose}
              options={purposeOptions}
              placeholder="사용목적을 선택하세요."
              headerLabel="사용목적 선택"
            />
          </div>
          
          <div style={s.formGroup}>
            <label style={s.formLabel}>전표구분 <span style={s.required}>*</span></label>
            <SelectDropdown
              value={slipType}
              onChange={setSlipType}
              options={slipOptions}
              placeholder="전표구분을 선택하세요."
              headerLabel="전표구분 선택"
            />
          </div>
          
          <div style={s.formGroup}>
            <label style={s.formLabel}>첨부파일</label>
            <button 
              style={s.attachBtn}
              onClick={() => {
                if ((window as any).FlutterBridge) {
                  (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'requestImageAttachment' }));
                } else {
                  alert('모바일 앱 환경에서만 사진 첨부가 가능합니다.');
                }
              }}
            >
              첨부파일 추가 <span style={s.attachPlus}>+</span>
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
                    <div key={idx} style={s.attachedFileItem}>
                      <img src={f.base64} alt="thumb" style={s.attachedFileThumb} />
                      <span style={s.attachedFileName}>{f.name} <span style={{ color: '#888' }}>({sizeKb}KB)</span></span>
                      <button 
                        style={s.attachedFileRemove}
                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                      >✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div style={s.instructionText}>
            실제 영수증 정보와 불일치하는 정보는 직접 수정해주세요.
          </div>
        </div>
        
        <div style={s.popupBottom}>
          <button 
            style={s.submitBtn}
            onClick={() => setIsConfirmOpen(true)}
          >
            경비내역 등록
          </button>
        </div>
      </div>

      {/* 등록 취소/확인 모달 */}
      {isConfirmOpen && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={s.modalTitle}>경비내역 등록</div>
            <div style={s.modalMessage}>해당 내역으로 경비를 등록하시겠습니까?</div>
            <div style={s.modalActionsList}>
              <button style={s.modalCancelBtn} onClick={() => setIsConfirmOpen(false)}>취소</button>
              <button style={s.modalConfirmBtn} onClick={() => {
                setIsConfirmOpen(false);
                const hasMandatory = purpose !== '' && slipType !== '';
                const hasAttachment = attachedFiles.length > 0;
                
                if (!hasMandatory) {
                  setAlertDialog({ isOpen: true, message: '사용목적과 전표구분을 모두 입력해주세요.' });
                  return;
                }
                const newIsSync = hasAttachment;
                
                if ((window as any).FlutterBridge) {
                  (window as any).FlutterBridge.postMessage(JSON.stringify({ 
                    action: 'updateReceiptSync', 
                    expenseId: receipt.id, 
                    isSync: newIsSync 
                  }));
                }
                
                if (newIsSync && onSynced) {
                  onSynced();
                }
                
                const msg = newIsSync ? '성공적으로 전송(Sync) 완료되었습니다.' : '첨부파일이 없어 임시저장 상태로 보관됩니다. (추후 등록 필요)';
                setAlertDialog({
                  isOpen: true,
                  message: msg,
                  onCloseCallback: () => {
                    onClose();
                  }
                });
              }}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* Alert 모달 */}
      {alertDialog.isOpen && (
        <div style={{ ...s.modalOverlay, zIndex: 999999 }}>
          <div style={s.modalContent}>
            <div style={s.modalTitle}>알림</div>
            <div style={s.modalMessage}>{alertDialog.message}</div>
            <div style={s.modalActionsList}>
              <button 
                style={s.modalConfirmBtn} 
                onClick={() => {
                  setAlertDialog({ isOpen: false, message: '' });
                  if (alertDialog.onCloseCallback) alertDialog.onCloseCallback();
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#fff', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
    overflow: 'hidden', position: 'relative'
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', backgroundColor: '#fff', borderBottom: '1px solid #eee', flexShrink: 0,
  },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '12px', display: 'flex', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },
  
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

  scrollArea: { flex: 1, overflowY: 'auto' as const, overscrollBehaviorY: 'none', display: 'flex', flexDirection: 'column' },
  
  cardCarouselWrapper: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 8,
  },
  cardCarousel: {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    padding: '0 16px',
    gap: 12,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  cardInfoBanner: {
    flexShrink: 0,
    width: 'calc(100vw - 32px)', // To make it peek -> or exactly full container viewport width
    maxWidth: '380px',
    scrollSnapAlign: 'center',
    padding: '24px 16px',
    background: 'linear-gradient(135deg, #749cff 0%, #4f7cff 100%)', 
    borderRadius: 12, display: 'flex', flexDirection: 'column',
    alignItems: 'center', color: '#fff',
    boxShadow: '0 4px 12px rgba(79, 124, 255, 0.3)',
    boxSizing: 'border-box' as const,
  },
  cardInfoLabel: { fontSize: 13, opacity: 0.9, marginBottom: 8 },
  cardInfoName: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  cardInfoNumber: { fontSize: 14, opacity: 0.9, letterSpacing: 0.5 },

  fabBtn: {
    position: 'absolute' as const, bottom: 24, right: 24, width: 46, height: 46,
    backgroundColor: '#2b5cff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(43,92,255,0.4)', fontSize: 20, fontWeight: 'bold', color: '#ffffff', border: 'none', cursor: 'pointer',
    zIndex: 100
  },

  dateFilterContainer: {
    margin: '0 16px 20px', display: 'flex', alignItems: 'center', gap: 8 
  },
  dateInputWrap: {
    flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px',
    backgroundColor: '#fff', position: 'relative' as const
  },
  dateInputText: { flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#333', backgroundColor: 'transparent', cursor: 'pointer' },
  calendarIcon: { width: 18, height: 18, flexShrink: 0, cursor: 'pointer', opacity: 0.6 },
  dateTilde: { color: '#64748b', fontWeight: 600 },

  sectionHeader: {
    display: 'flex', flexDirection: 'column', padding: '16px 16px 8px'
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: '#64748b' },

  listContainer: { padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  receiptCard: {
    padding: '16px', backgroundColor: '#fff', border: '1px solid #f1f3f5',
    borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6,
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)', cursor: 'pointer', transition: 'all 0.2s',
  },
  receiptTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  receiptDate: { fontSize: 13, color: '#4f7cff', fontWeight: 500 },
  receiptArrow: { fontSize: 18, color: '#cbd5e1', lineHeight: 1 },
  receiptStore: { fontSize: 16, fontWeight: 700, color: '#111', marginTop: 2 },
  receiptInfo: { fontSize: 13, color: '#64748b' },

  // --- 영수증 등록 바텀시트(팝업) 스타일 ---
  popupOverlay: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9999, display: 'flex', flexDirection: 'column',
    padding: '56px 0 0 0', // 헤더 높이만큼 상단 여백 
  },
  popupContainer: {
    flex: 1, display: 'flex', flexDirection: 'column',
    backgroundColor: '#fff',
    margin: 0, // 좌, 우, 하단 꽉 채움
    borderRadius: 0, // 상단 라운드 처리 제거
    overflow: 'hidden',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', // 위로 살짝 뜨는 그림자 모양
  },
  popupHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px', borderBottom: '1px dashed #e2e8f0', flexShrink: 0,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
  popupReceiptDate: { fontSize: 13, color: '#4f7cff', marginBottom: 6 },
  popupReceiptStore: { fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6 },
  popupReceiptAddress: { fontSize: 13, color: '#8e8e93', marginBottom: 20 },
  
  separator: { height: 1, backgroundColor: '#e2e8f0', width: '100%', marginBottom: 16 },
  
  amountRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  amountLabel: { fontSize: 14, color: '#333' },
  amountValue: { fontSize: 14, color: '#111' },
  amountValueTotal: { fontSize: 16, fontWeight: 700, color: '#111' },
  amountNum: { fontSize: 16, fontWeight: 700 },

  formGroup: { marginBottom: 20, display: 'flex', flexDirection: 'column', position: 'relative' as const },
  formLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  required: { color: '#ef4444' },
  
  inputDisabled: {
    backgroundColor: '#f8fafc', padding: '12px', borderRadius: 8,
    border: '1px solid #f1f5f9', color: '#64748b', fontSize: 15
  },
  
  attachBtn: {
    padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8,
    border: 'none', color: '#333', fontSize: 15, fontWeight: 500, cursor: 'pointer',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6
  },
  attachPlus: { color: '#4f7cff', fontWeight: 'bold' },
  
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
  
  instructionText: {
    fontSize: 12, color: '#8e8e93', textAlign: 'center' as const, marginTop: 4, marginBottom: 8
  },

  popupBottom: {
    padding: '16px 20px 24px', flexShrink: 0, backgroundColor: '#fff',
  },
  submitBtn: {
    width: '100%', padding: '16px 0', backgroundColor: '#2b5cff', color: '#fff', fontSize: 16, fontWeight: 700,
    border: 'none', borderRadius: 12, cursor: 'pointer'
  },
  
  // Custom Registration Confirm Modal Styles
  modalOverlay: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  modalContent: {
    width: '320px', backgroundColor: '#fff', borderRadius: 16, padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column'
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 },
  modalMessage: { fontSize: 15, color: '#555', lineHeight: 1.5, marginBottom: 24 },
  modalActionsList: { display: 'flex', gap: 8 },
  modalCancelBtn: {
    flex: 1, padding: '12px 0', backgroundColor: '#f1f5f9', color: '#475569', fontSize: 15, fontWeight: 600,
    border: 'none', borderRadius: 8, cursor: 'pointer'
  },
  modalConfirmBtn: {
    flex: 1, padding: '12px 0', backgroundColor: '#2b5cff', color: '#fff', fontSize: 15, fontWeight: 600,
    border: 'none', borderRadius: 8, cursor: 'pointer'
  }
};
