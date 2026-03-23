import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface Notification {
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

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseNotificationsReturn {
  notifications: Notification[];
  loaded: boolean;
  loading: boolean;
  selectedId: number | null;
  userId: string | null;
  onLoadMore: () => void;
  onSelectItem: (id: number) => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useNotifications(): UseNotificationsReturn {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /**
   * 더보기 클릭 핸들러
   * 실제 환경에서는 fetch 블록을 활성화하고 dummy 부분을 제거하세요.
   */
  const onLoadMore = useCallback(async () => {
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
      await new Promise((r) => setTimeout(r, 500));
      setNotifications(DUMMY_NOTIFICATIONS);
    } catch (err) {
      console.error('알림 로드 실패:', err);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  }, [userId]);

  const onSelectItem = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  return { notifications, loaded, loading, selectedId, userId, onLoadMore, onSelectItem };
}
