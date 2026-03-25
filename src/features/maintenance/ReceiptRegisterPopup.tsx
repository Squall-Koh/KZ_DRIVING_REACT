import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface ReceiptFormData {
  date: string;
  shopName: string;
  amount: string;
  address: string;
  note: string;
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
  const [formData, setFormData] = useState<ReceiptFormData>({
    date: initialData?.date || '',
    shopName: initialData?.shopName || '',
    amount: initialData?.amount || '',
    address: initialData?.address || '',
    note: initialData?.note || '',
  });

  const handleChange = (field: keyof ReceiptFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* 헤더 */}
        <div style={styles.header}>
          <div style={{ width: 24 }} /> {/* 좌측 여백 균형 */}
          <span style={styles.title}>영수증 등록</span>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={28} color="#111" strokeWidth={1.5} />
          </button>
        </div>

        {/* 폼 영역 */}
        <div style={styles.formContent}>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>거래일자 <span style={styles.asterisk}>*</span></label>
            <input
              style={styles.input}
              type="text"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>가맹점명 <span style={styles.asterisk}>*</span></label>
            <input
              style={styles.input}
              type="text"
              value={formData.shopName}
              onChange={(e) => handleChange('shopName', e.target.value)}
              placeholder="가맹점명을 입력하세요"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>거래금액 <span style={styles.asterisk}>*</span></label>
            <input
              style={styles.input}
              type="text"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="금액을 입력하세요"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>가맹점주소 <span style={styles.asterisk}>*</span></label>
            <input
              style={styles.input}
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="주소를 입력하세요"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>비고 <span style={styles.asterisk}>*</span></label>
            <input
              style={styles.input}
              type="text"
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="비고를 입력하세요"
            />
          </div>

          <p style={styles.hintText}>
            실제 영수증 정보와 불일치하는 정보는 직접 수정해주세요.
          </p>
        </div>

        {/* 하단 버튼 */}
        <div style={styles.bottomWrap}>
          <button style={styles.submitBtn} onClick={() => onSubmit(formData)}>
            경비내역 등록
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  container: {
    height: '92vh', // 상단 헤더를 조금 제외한 전체 팝업 느낌
    backgroundColor: '#fff',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
    animation: 'slideUp 0.3s ease-out forwards',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px', borderBottom: '1px solid #f1f3f5',
  },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' },
  formContent: {
    flex: 1, overflowY: 'auto', padding: '24px 20px',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: '#555' },
  asterisk: { color: '#ef4444' },
  input: {
    width: '100%', padding: '14px 16px', fontSize: 15,
    border: '1px solid #e2e8f0', borderRadius: 8,
    outline: 'none', color: '#111', boxSizing: 'border-box',
  },
  hintText: {
    fontSize: 13, color: '#888', textAlign: 'center',
    marginTop: 12, marginBottom: 20,
  },
  bottomWrap: { padding: '16px 20px 32px', backgroundColor: '#fff', borderTop: '1px solid #f1f3f5' },
  submitBtn: {
    width: '100%', padding: '16px 0', fontSize: 16, fontWeight: 'bold',
    color: '#fff', backgroundColor: '#4f7cff', border: 'none', borderRadius: 12,
    cursor: 'pointer',
  },
};
