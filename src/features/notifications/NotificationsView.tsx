import React from 'react';
import blankIcon from '../../assets/icon_blank_notification.png';
import type { Notification } from './useNotifications';

// ─── Props 타입 ──────────────────────────────────────────────
interface NotificationsViewProps {
  notifications: Notification[];
  loaded: boolean;
  loading: boolean;
  selectedId: number | null;
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

// ─── View 컴포넌트 (순수 UI) ─────────────────────────────────
export function NotificationsView({
  notifications,
  loaded,
  loading,
  selectedId,
  onLoadMore,
  onSelectItem,
}: NotificationsViewProps) {
  const hasNotifications = notifications.length > 0;

  return (
    <div style={styles.container}>

      {/* ── 스크롤 콘텐츠 영역 ────────────────────────────────── */}
      <div style={styles.scrollArea}>
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
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* ── 더보기 버튼 (하단 고정) ───────────────────────────── */}
      <div style={styles.footer}>
        <button
          style={styles.loadMoreBtn}
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? '불러오는 중...' : '더보기'}
        </button>
      </div>
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

  /* 더보기 버튼 영역 */
  footer: {
    flexShrink: 0,
    padding: '10px 16px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  loadMoreBtn: {
    width: '35%',
    minWidth: '120px',
    padding: '12px 0',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: '#f0f0f0',
    color: '#444444',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
};
