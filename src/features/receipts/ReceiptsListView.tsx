import React from 'react';
import type { UseReceiptsListReturn } from './useReceiptsList';

export function ReceiptsListView({
  tab,
  onTabChange,
  corporateReceipts,
  personalReceipts,
  corporateCardInfo,
  personalCardInfo,
  onBack,
}: UseReceiptsListReturn) {
  const activeReceipts = tab === 'corporate' ? corporateReceipts : personalReceipts;

  return (
    <div style={s.container}>
      {/* 헤더 */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>‹</button>
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

      <div style={s.scrollArea}>
        {/* 등록된 정보 배너 */}
        {tab === 'corporate' ? (
          <div style={s.cardInfoBanner}>
            <span style={s.cardInfoLabel}>등록된 법인카드</span>
            <span style={s.cardInfoName}>{corporateCardInfo.name}</span>
            <span style={s.cardInfoNumber}>{corporateCardInfo.number}</span>
          </div>
        ) : (
          <div style={s.cardInfoBanner}>
            <span style={s.cardInfoLabel}>등록된 개인카드</span>
            <span style={s.cardInfoName}>{personalCardInfo.name}</span>
            <span style={s.cardInfoNumber}>{personalCardInfo.number}</span>
          </div>
        )}

        <div style={s.sectionHeader}>
          <div style={s.sectionTitle}>처리할 영수증</div>
          <div style={s.sectionDesc}>
            하단의 {tab === 'corporate' ? '법인' : '개인'}카드 영수증을 선택하여 경비등록을 완료해주세요.
          </div>
        </div>

        {/* 영수증 리스트 */}
        <div style={s.listContainer}>
          {activeReceipts.map((receipt) => (
            <div key={receipt.id} style={s.receiptCard}>
              <div style={s.receiptTop}>
                <span style={s.receiptDate}>{receipt.date}</span>
                <span style={s.receiptArrow}>›</span>
              </div>
              <div style={s.receiptStore}>{receipt.store}</div>
              <div style={s.receiptInfo}>거래금액 : {receipt.amount.toLocaleString()}원</div>
              <div style={s.receiptInfo}>가맹점주소 : {receipt.address}</div>
            </div>
          ))}
          {activeReceipts.length === 0 && (
            <div style={{ textAlign: 'center', color: '#aaa', padding: 40, fontSize: 14 }}>
              내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#fff', fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', backgroundColor: '#fff', flexShrink: 0,
  },
  backBtn: { fontSize: 24, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
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

  scrollArea: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' },
  
  cardInfoBanner: {
    margin: '8px 16px 24px', padding: '24px 16px',
    backgroundColor: '#4f7cff', borderRadius: 12, display: 'flex', flexDirection: 'column',
    alignItems: 'center', color: '#fff'
  },
  cardInfoLabel: { fontSize: 13, opacity: 0.9, marginBottom: 8 },
  cardInfoName: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  cardInfoNumber: { fontSize: 14, opacity: 0.9, letterSpacing: 0.5 },

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

  sectionHeader: { padding: '0 16px 12px' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 },
  sectionDesc: { fontSize: 13, color: '#64748b' },

  listContainer: { padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  receiptCard: {
    padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6,
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  receiptTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  receiptDate: { fontSize: 13, color: '#4f7cff', fontWeight: 500 },
  receiptArrow: { fontSize: 18, color: '#cbd5e1', lineHeight: 1 },
  receiptStore: { fontSize: 16, fontWeight: 700, color: '#111', marginTop: 2 },
  receiptInfo: { fontSize: 13, color: '#64748b' }
};
