import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import blankIcon from '../assets/icon_blank_notification.png';

// ─── 타입 정의 ───────────────────────────────────────────────
interface Notification {
  id: number;
  date: string;
  title: string;
  body: string;
}

// ─── Dummy 데이터 (실제 POST API 대체) ────────────────────────
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    date: '2026-03-01 12:30',
    title: '[운행종료 알림]',
    body: '차량운행 종료가 감지되었습니다.\n운행일지 작성을 완료합니다.',
  },
  {
    id: 2,
    date: '2026-03-01 11:00',
    title: '[운행감지 알림]',
    body: '차량운행이 감지되었습니다.\n운행일지 작성을 시작합니다.',
  },
  {
    id: 3,
    date: '2026-03-01 07:31',
    title: '[출근등록 알림]',
    body: '2026.03.01 출근 등록이 완료 되었습니다.\n출근 시간 : 07시 30분',
  },
  {
    id: 4,
    date: '2026-03-01 07:29',
    title: '[차량연결 알림]',
    body: '차량탑승이 감지되었습니다.\n연결차량 : 123 허 4567',
  },
  {
    id: 5,
    date: '2026-02-28 09:00',
    title: '[정비필요 알림]',
    body: '정비가 필요한 항목이 있습니다.\n정비관리 메뉴를 확인해주세요.',
  },
  {
    id: 6,
    date: '2026-02-27 18:15',
    title: '[운행종료 알림]',
    body: '차량운행 종료가 감지되었습니다.\n운행일지 작성을 완료합니다.',
  },
  {
    id: 7,
    date: '2026-02-27 08:45',
    title: '[출근등록 알림]',
    body: '2026.02.27 출근 등록이 완료 되었습니다.\n출근 시간 : 08시 44분',
  },
  {
    id: 8,
    date: '2026-02-26 17:30',
    title: '[퇴근등록 알림]',
    body: '2026.02.26 퇴근 등록이 완료 되었습니다.\n퇴근 시간 : 17시 29분',
  },
  {
    id: 9,
    date: '2026-02-26 09:10',
    title: '[차량연결 알림]',
    body: '차량탑승이 감지되었습니다.\n연결차량 : 456 가 7890',
  },
  {
    id: 10,
    date: '2026-02-25 13:00',
    title: '[운행감지 알림]',
    body: '차량운행이 감지되었습니다.\n운행일지 작성을 시작합니다.',
  },
];

// ─── 컴포넌트 ─────────────────────────────────────────────────
export function Notifications() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  // 초기 상태: 빈 화면 (아무것도 로드되지 않음)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /**
   * 더보기 클릭 핸들러
   * 실제 환경에서는 아래 fetch 블록을 활성화하고 dummy 부분을 제거하세요.
   */
  const handleLoadMore = useCallback(async () => {
    setLoading(true);
    try {
      // ── 실제 API 호출 (추후 활성화) ──────────────────────────
      // const res = await fetch('/api/notifications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId }),
      // });
      // const data: Notification[] = await res.json();
      // setNotifications(data);

      // ── 더미 데이터 (개발용) ──────────────────────────────────
      await new Promise((r) => setTimeout(r, 500)); // 로딩 시뮬레이션
      setNotifications(DUMMY_NOTIFICATIONS);
    } catch (err) {
      console.error('알림 로드 실패:', err);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  }, [userId]);

  const hasNotifications = notifications.length > 0;

  return (
    <div style={styles.container}>

      {/* ── 스크롤 콘텐츠 영역 (더보기 버튼 위) ─────────────── */}
      <div style={styles.scrollArea}>
        {!loaded ? (
          /* 초기 빈 화면 */
          <div style={styles.emptyWrapper}>
            <div style={styles.emptyIconCircle}>
              <img
                src={blankIcon}
                alt="알림 없음"
                style={styles.emptyIcon}
              />
            </div>
            <p style={styles.emptyText}>수신한 알림이 없습니다</p>
          </div>
        ) : hasNotifications ? (
          /* 알림 목록 */
          <div style={styles.listWrapper}>
            {notifications.map((noti) => (
              <div
                key={noti.id}
                onClick={() => setSelectedId(noti.id === selectedId ? null : noti.id)}
                style={{
                  ...styles.card,
                  ...(noti.id === selectedId ? styles.cardSelected : {}),
                }}
              >
                <p style={styles.cardDate}>{noti.date}</p>
                <p style={styles.cardTitle}>{noti.title}</p>
                <p style={styles.cardBody}>{noti.body}</p>
              </div>
            ))}
          </div>
        ) : (
          /* API 호출 후 결과 없음 */
          <div style={styles.emptyWrapper}>
            <div style={styles.emptyIconCircle}>
              <img
                src={blankIcon}
                alt="알림 없음"
                style={styles.emptyIcon}
              />
            </div>
            <p style={styles.emptyText}>수신한 알림이 없습니다</p>
          </div>
        )}
      </div>

      {/* ── 더보기 버튼 (flex 하단 — 스크롤 영역 밖) ─────────── */}
      <div style={styles.footer}>
        <button
          style={styles.loadMoreBtn}
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? '불러오는 중...' : '더보기'}
        </button>
      </div>
    </div>
  );
}

// ─── 인라인 스타일 (Flutter WebView 내 순수 렌더링에 적합) ────
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
  },
  cardNew: {
    borderColor: '#2563eb',
    borderStyle: 'dashed',
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

  /* 더보기 버튼 영역 - flex 하단 (스크롤 영역 밖) */
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
