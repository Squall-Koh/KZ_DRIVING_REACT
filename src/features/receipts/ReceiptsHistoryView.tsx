import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, ChevronLeft } from 'lucide-react';
import { usePullToRefresh } from '../notifications/usePullToRefresh';
import type { UseReceiptsHistoryReturn } from './useReceiptsHistory';

export function ReceiptsHistoryView({
  startDate,
  endDate,
  onBack,
  items,
  loading,
  hasMore,
  observerRef,
  onRefresh,
  onLoadMore,
}: UseReceiptsHistoryReturn) {
  const displayPeriod = `${startDate.replace(/-/g, '.')} ~ ${endDate.replace(/-/g, '.')}`;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFabVisible, setIsFabVisible] = useState(false);

  const { pullDist, isPulling, isPullRate } = usePullToRefresh(scrollRef, onRefresh, loading);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, observerRef]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    setIsFabVisible(scrollRef.current.scrollTop > 200);
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
        <button style={s.backBtn} onClick={onBack}>
          <ChevronLeft size={28} color="#111" />
        </button>
        <span style={s.title}>경비내역 조회</span>
        <div style={{ width: 32 }} />
      </div>

      {/* 기간 표시 (상단 고정) */}
      <div style={s.periodHeader}>
        <span style={s.periodText}>{displayPeriod}</span>
      </div>

      <div 
        style={s.scrollArea}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div style={{
          ...s.pullIndicator,
          height: `${pullDist}px`,
          opacity: isPullRate,
          transition: isPulling ? 'none' : 'height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={16} color="#888" style={{ transform: `rotate(${isPullRate * 360}deg)` }} />
            <span>
              {loading && pullDist > 0 ? '데이터를 가져오는 중...' : (pullDist > 50 ? '놓아서 새로고침...' : '아래로 당기세요')}
            </span>
          </div>
        </div>

        {/* 리스트 */}
        <div style={s.listContainer}>
          {items.map((expense) => (
             <div key={expense.id} style={s.receiptCard}>
              <div style={s.receiptTop}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontSize: 13, color: '#4f7cff', fontWeight: 600 }}>{expense.date.split(' ')[0]}</span>
                  {expense.date.split(' ')[1] && <span style={{ fontSize: 12, color: '#888' }}>{expense.date.split(' ')[1].substring(0, 5)}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {renderBadge(expense.cardType)}
                  {expense.isSync && <span style={{ width: 46, textAlign: 'center', padding: '3px 0', borderRadius: 4, fontSize: 10, color: '#ef4444', backgroundColor: '#fee2e2', boxSizing: 'border-box' }}>전송완료</span>}
                </div>
              </div>
              <div style={s.receiptStore}>{expense.store}</div>
              <div style={s.receiptInfo}>거래금액 : {expense.amount.toLocaleString()}원</div>
              <div style={s.receiptInfo}>가맹점주소 : {expense.address}</div>
            </div>
          ))}
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: 13 }}>
              목록 불러오는 중...
            </div>
          )}
          {!loading && !hasMore && items.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#bbb', fontSize: 13 }}>
              더 이상 내역이 없습니다.
            </div>
          )}

          {!loading && items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#aaa', padding: 40, fontSize: 14 }}>
              내역이 없습니다.
            </div>
          )}

          <div ref={observerRef} style={{ height: 20 }} />
        </div>
      </div>

      {isFabVisible && (
        <button style={s.fabBtn} onClick={scrollToTop}>↑</button>
      )}
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
    padding: '14px 16px', backgroundColor: '#fff', borderBottom: '1px solid #eee', flexShrink: 0,
  },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '12px', display: 'flex', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 700, color: '#111' },
  
  scrollArea: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', position: 'relative' },
  
  periodHeader: { 
    padding: '16px 20px', display: 'flex', alignItems: 'center'
  },
  periodText: { fontSize: 16, fontWeight: 700, color: '#333' },

  listContainer: { padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  receiptCard: {
    padding: '16px', backgroundColor: '#fff', border: '1px solid #f1f3f5',
    borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6,
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
  },
  receiptTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  receiptDate: { fontSize: 14, color: '#4f7cff', fontWeight: 500 },
  badge: { width: 46, fontSize: 12, fontWeight: 600, padding: '4px 0', textAlign: 'center', borderRadius: 4, boxSizing: 'border-box' },
  
  receiptStore: { fontSize: 16, fontWeight: 700, color: '#111', marginTop: 2 },
  receiptInfo: { fontSize: 13, color: '#64748b' },

  pullIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888888', fontSize: '13px', transition: 'height 0.1s ease-out, opacity 0.1s ease-out', overflow: 'hidden', flexShrink: 0, width: '100%' },
  
  fabBtn: {
    position: 'fixed' as const, bottom: 24, right: 16, width: 48, height: 48, 
    borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: 24, 
    fontWeight: 'bold', border: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.4)', 
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    zIndex: 50, transition: 'all 0.2s',
  }
};
