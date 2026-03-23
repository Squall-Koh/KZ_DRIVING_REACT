import React from 'react';
import type { UseReceiptsHistoryReturn } from './useReceiptsHistory';

export function ReceiptsHistoryView({
  recentExpenses,
  startDate,
  endDate,
  onBack,
}: UseReceiptsHistoryReturn) {
  const displayPeriod = `${startDate.replace(/-/g, '.')} ~ ${endDate.replace(/-/g, '.')}`;

  const renderBadge = (type?: string) => {
    switch(type) {
      case 'simple':
        return <span style={{ ...s.badge, color: '#f97316', backgroundColor: '#ffedd5' }}>간이영수증</span>;
      case 'corporate':
        return <span style={{ ...s.badge, color: '#10b981', backgroundColor: '#d1fae5' }}>법인카드</span>;
      case 'personal':
      default:
        return <span style={{ ...s.badge, color: '#4f7cff', backgroundColor: '#eff6ff' }}>개인카드</span>;
    }
  };

  return (
    <div style={s.container}>
      {/* 헤더 */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>‹</button>
        <span style={s.title}>경비내역 조회</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={s.scrollArea}>
        {/* 기간 표시 */}
        <div style={s.periodHeader}>
          <span style={s.periodText}>{displayPeriod}</span>
          <span style={s.periodArrow}>∨</span>
        </div>

        {/* 리스트 */}
        <div style={s.listContainer}>
          {recentExpenses.map((expense) => (
            <div key={expense.id} style={s.receiptCard}>
              <div style={s.receiptTop}>
                <span style={s.receiptDate}>{expense.date}</span>
                {renderBadge(expense.receiptType)}
              </div>
              <div style={s.receiptStore}>{expense.store}</div>
              <div style={s.receiptInfo}>거래금액 : {expense.amount.toLocaleString()}원</div>
              <div style={s.receiptInfo}>가맹점주소 : {expense.address}</div>
            </div>
          ))}
          {recentExpenses.length === 0 && (
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
  
  scrollArea: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' },
  
  periodHeader: { 
    padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  periodText: { fontSize: 16, fontWeight: 700, color: '#333' },
  periodArrow: { fontSize: 16, color: '#888', fontWeight: 600 },

  listContainer: { padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  receiptCard: {
    padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6,
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  receiptTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  receiptDate: { fontSize: 14, color: '#4f7cff', fontWeight: 500 },
  badge: { fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 4 },
  
  receiptStore: { fontSize: 16, fontWeight: 700, color: '#111', marginTop: 2 },
  receiptInfo: { fontSize: 13, color: '#64748b' }
};
