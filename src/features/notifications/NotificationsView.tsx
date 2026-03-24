import React from 'react';
import blankIcon from '../../assets/icon_blank_notification.png';
import type { Notification } from './useNotifications';

import { usePullToRefresh } from './usePullToRefresh';

// ─── Props 타입 ──────────────────────────────────────────────
interface NotificationsViewProps {
  notifications: Notification[];
  loaded: boolean;
  loading: boolean;
  hasMore: boolean;
  selectedId: number | null;
  isFabVisible: boolean;
  onRefresh: () => void;
  observerRef: React.RefObject<HTMLDivElement | null>;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onLoadMore: () => void;
  onSelectItem: (id: number) => void;
}

// ─── 빈 화면 (공통) ──────────────────────────────────────────
function EmptyState() {
  return (
    <div style={styles.emptyWrapper}>
      <div style={styles.emptyIconCircle}>
        <img src={blankIcon} alt="알림 없음" style={styles.emptyIcon} />
      </div>
      <p style={styles.emptyText}>수신한 알림이 없습니다</p>
    </div>
  );
}

// ─── 알림 카드 ───────────────────────────────────────────────
function NotificationCard({
  notification,
  isSelected,
  onSelect,
}: {
  notification: Notification;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        ...styles.card,
        ...(isSelected ? styles.cardSelected : {}),
      }}
    >
      <p style={styles.cardDate}>{notification.date}</p>
      <p style={styles.cardTitle}>{notification.title}</p>
      <p style={styles.cardBody}>{notification.body}</p>
    </div>
  );
}

export function NotificationsView({
  notifications,
  loaded,
  loading,
  selectedId,
  isFabVisible,
  onRefresh,
  observerRef,
  scrollAreaRef,
  onSelectItem,
}: NotificationsViewProps) {
  const hasNotifications = notifications.length > 0;
  
  // Pull-to-Refresh 훅 적용
  const { pullDist, isPullRate } = usePullToRefresh(scrollAreaRef, onRefresh);

  const scrollToTop = () => {
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={styles.container}>

      {/* ── 스크롤 콘텐츠 영역 ────────────────────────────────── */}
      <div style={styles.scrollArea} ref={scrollAreaRef as unknown as React.RefObject<HTMLDivElement>}>
        
        {/* Pull to Refresh Indicator */}
        <div 
          style={{
            ...styles.ptrIndicator,
            height: `${pullDist}px`,
            opacity: isPullRate,
          }}
        >
          {pullDist > 50 ? '놓아서 새로고침...' : '아래로 당기세요'}
        </div>

        {!loaded ? (
          <EmptyState />
        ) : hasNotifications ? (
          <div style={styles.listWrapper}>
            {notifications.map((noti) => (
              <NotificationCard
                key={noti.id}
                notification={noti}
                isSelected={noti.id === selectedId}
                onSelect={() => onSelectItem(noti.id)}
              />
            ))}
            
            {/* ── 무한 스크롤 관측 타겟 ─────────────────────── */}
            <div ref={observerRef as unknown as React.RefObject<HTMLDivElement>} style={{ height: '20px', backgroundColor: 'transparent' }} />
            
            {loading && (
              <div style={styles.loadingFooter}>알림 불러오는 중...</div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* ── FAB (위로 가기 버튼) ────────────────────────────── */}
      {isFabVisible && (
        <button style={styles.fabBtn} onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
  },

  /* 스크롤 가능한 콘텐츠 영역 */
  scrollArea: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative' as const,
  },
  
  /* Pull to Refresh 스타일 */
  ptrIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888888',
    fontSize: '13px',
    transition: 'height 0.1s ease-out, opacity 0.1s ease-out',
    overflow: 'hidden',
  },

  /* 빈 상태 */
  emptyWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
  },
  emptyIconCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emptyIcon: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
  },
  emptyText: {
    fontSize: '15px',
    color: '#888888',
    margin: 0,
  },

  /* 알림 목록 */
  listWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    padding: '8px 0',
  },
  card: {
    margin: '6px 16px',
    padding: '14px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #eeeeee',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  cardSelected: {
    borderColor: '#2563eb',
    borderStyle: 'solid',
    backgroundColor: '#f8faff',
  },
  cardDate: {
    fontSize: '12px',
    color: '#999999',
    margin: '0 0 6px 0',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#222222',
    margin: '0 0 4px 0',
  },
  cardBody: {
    fontSize: '13px',
    color: '#444444',
    margin: 0,
    whiteSpace: 'pre-line',
    lineHeight: '1.6',
  },

  loadingFooter: {
    padding: '15px 0',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#888',
  },

  /* FAB (Floating Action Button) */
  fabBtn: {
    position: 'absolute' as const,
    bottom: '24px',
    right: '24px',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: '#2b5cff',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 'bold',
    border: 'none',
    boxShadow: '0 4px 10px rgba(43,92,255,0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
};
