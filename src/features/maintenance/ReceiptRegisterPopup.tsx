import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { DatePicker } from '../../components/DatePicker';
import { SelectDropdown } from '../../components/SelectDropdown';

export interface ReceiptFormData {
  date: string;
  shopName: string;
  amount: string;
  address: string;
  cardType: string;
  purpose: string;
  slipType: string;
  attachedFiles: { name: string; base64: string }[];
}

interface ReceiptRegisterPopupProps {
  initialData?: Partial<ReceiptFormData>;
  onClose: () => void;
  onSubmit: (data: ReceiptFormData) => void;
}

export function ReceiptRegisterPopup({
  initialData,
  onClose,
  onSubmit,
}: ReceiptRegisterPopupProps) {
  const [date, setDate] = useState(initialData?.date || '');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [store, setStore] = useState(initialData?.shopName || '');
  const [amount, setAmount] = useState(initialData?.amount ? Number(initialData.amount).toLocaleString() : '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [purpose, setPurpose] = useState(initialData?.purpose || '');
  const [slipType, setSlipType] = useState(initialData?.slipType || '');
  const [cardType, setCardType] = useState(initialData?.cardType || 'simple');
  const [attachedFiles, setAttachedFiles] = useState<{name: string; base64: string}[]>(initialData?.attachedFiles || []);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean; message: string; onCloseCallback?: () => void}>({ isOpen: false, message: '' });

  const cardTypeOptions = [
    { label: '법인카드', value: 'corporate' },
    { label: '개인카드', value: 'personal' },
    { label: '간이영수증', value: 'simple' },
  ];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericVal = e.target.value.replace(/[^0-9]/g, '');
    if (!numericVal) {
      setAmount('');
      return;
    }
    setAmount(Number(numericVal).toLocaleString());
  };

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
          <span style={ms.popupTitle}>정비영수증 등록</span>
          <button style={ms.popupCloseBtn} onClick={onClose}>✕</button>
        </div>
        
        {/* 스크롤 콘텐츠 */}
        <div style={ms.popupScroll}>
          {/* 거래일자 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>거래일자 <span style={ms.required}>*</span></label>
            <div 
              style={{ ...ms.input, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setIsDatePickerOpen(true)}
            >
              <span>{date || 'YYYY-MM-DD'}</span>
              <Calendar size={18} color="#666" />
            </div>
          </div>

          {/* 가맹점명 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>가맹점명 <span style={ms.required}>*</span></label>
            <input style={ms.input} value={store} onChange={e => setStore(e.target.value)} placeholder="가맹점명을 입력하세요" />
          </div>

          {/* 거래금액 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>거래금액 <span style={ms.required}>*</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                style={{ ...ms.input, paddingRight: 30, textAlign: 'right' }} 
                value={amount} 
                onChange={handleAmountChange} 
                placeholder="0"
              />
              <span style={{ position: 'absolute', right: 12, color: '#111', fontSize: 15, fontWeight: 500 }}>원</span>
            </div>
          </div>

          {/* 가맹점주소 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>가맹점주소 <span style={ms.required}>*</span></label>
            <input style={ms.input} value={address} onChange={e => setAddress(e.target.value)} placeholder="주소를 입력하세요" />
          </div>

          {/* 지출증빙 */}
          <div style={ms.formGroup}>
            <label style={ms.formLabel}>지출증빙 <span style={ms.required}>*</span></label>
            <SelectDropdown
              value={cardType}
              onChange={setCardType}
              options={cardTypeOptions}
              placeholder="카드 구분을 선택하세요."
              headerLabel="지출증빙(카드) 선택"
            />
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
            <label style={ms.formLabel}>첨부파일 <span style={ms.required}>*</span></label>
            <button 
              style={ms.attachBtn}
              onClick={() => {
                if ((window as any).FlutterBridge) {
                  (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'requestImageAttachment' }));
                } else {
                  alert('모바일 앱 환경에서만 사진 첨부가 가능합니다.');
                  // Mock attachment
                  setAttachedFiles(prev => [...prev, { name: 'mock_image.jpg', base64: 'data:image/jpeg;base64,mock' }]);
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
            정비내역 등록
          </button>
        </div>
      </div>

      {/* 등록 확인 커스텀 모달 다이얼로그 */}
      {isConfirmOpen && (
        <div style={ms.modalOverlay}>
          <div style={ms.modalContent}>
            <div style={ms.modalTitle}>정비 영수증 등록</div>
            <div style={ms.modalMessage}>작성하신 내역으로 영수증을 등록하시겠습니까?</div>
            <div style={ms.modalActionsList}>
              <button style={ms.modalCancelBtn} onClick={() => setIsConfirmOpen(false)}>취소</button>
              <button style={ms.modalConfirmBtn} onClick={() => {
                setIsConfirmOpen(false);
                const hasMandatory = date !== '' && store !== '' && amount !== '' && address !== '' && purpose !== '' && slipType !== '';
                const hasAttachment = attachedFiles.length > 0;
                
                if (!hasMandatory || !hasAttachment) {
                  setAlertDialog({ isOpen: true, message: '모든 내용을 입력해 주시고 첨부파일을 추가해 주세요.' });
                  return;
                }
                
                onSubmit({
                  date,
                  shopName: store,
                  amount,
                  address,
                  cardType,
                  purpose,
                  slipType,
                  attachedFiles,
                });
                
                setAlertDialog({ isOpen: true, message: '성공적으로 영수증이 등록되었습니다.', onCloseCallback: () => onClose() });
              }}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* Validation / Alert Modal */}
      {alertDialog.isOpen && (
        <div style={ms.modalOverlay}>
          <div style={{ ...ms.modalContent, paddingBottom: 24 }}>
            <div style={ms.modalTitle}>알림</div>
            <div style={ms.modalMessage}>{alertDialog.message}</div>
            <button 
              style={ms.modalConfirmBtn} 
              onClick={() => {
                setAlertDialog({ isOpen: false, message: '' });
                if (alertDialog.onCloseCallback) {
                  alertDialog.onCloseCallback();
                }
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 날짜 선택 달력 Popup */}
      {isDatePickerOpen && (
        <DatePicker
          initialDate={date}
          onConfirm={(selectedDate) => {
            setDate(selectedDate);
            setIsDatePickerOpen(false);
          }}
          onCancel={() => setIsDatePickerOpen(false)}
        />
      )}
    </div>
  );
}

// ─── 팝업 스타일 (ManualReceiptPopup와 동일) ──────────────────────────────────────────────────
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
