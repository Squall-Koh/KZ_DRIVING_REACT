import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface Notification {
  id: number;
  date: string;
  title: string;
  body: string;
}

// ─── Bridge 인터페이스 ──────────────────────────────────────────
declare global {
  interface Window {
    FlutterBridge?: {
      postMessage: (message: string) => void;
    };
    // Flutter -> React 응답 콜백
    updateNotifications?: (jsonString: string) => void;
  }
}

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseNotificationsReturn {
  notifications: Notification[];
  loaded: boolean;
  loading: boolean;
  hasMore: boolean;            // 다음 페이지 존재 여부
  selectedId: number | null;
  userId: string | null;
  isFabVisible: boolean;
  onRefresh: () => void;
  observerRef: React.RefObject<HTMLDivElement | null>;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
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

  const [hasMore, setHasMore] = useState(true);
  const [isFabVisible, setIsFabVisible] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 1. Flutter에서 데이터 응답 수신
  const handleUpdateNotifications = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString) as {
        notifications: Notification[];
        hasMore: boolean;
        offset: number;
      };

      setNotifications((prev) => {
        // offset이 0이면 새로운 데이터로 덮어쓰기 (새로고침)
        if (data.offset === 0) {
          return data.notifications;
        }
        // 그 외엔 기존 배열 끝에 추가
        return [...prev, ...data.notifications];
      });

      setHasMore(data.hasMore);
      setLoaded(true);
      setLoading(false);
    } catch (err) {
      console.error('Failed to parse notifications:', err);
      setLoading(false);
    }
  }, []);

  // 2. 초기 로드시 전역 콜백 등록 및 첫 데이터 요청 (offset: 0)
  useEffect(() => {
    window.updateNotifications = handleUpdateNotifications;

    setLoading(true);
    if (window.FlutterBridge) {
      window.FlutterBridge.postMessage(
        JSON.stringify({
          action: 'requestNotifications',
          offset: 0,
          limit: 10,
        })
      );
    } else {
      // Flutter 브릿지가 없을 경우 (웹 단독 테스트)
      setTimeout(() => {
        setLoaded(true);
        setLoading(false);
      }, 500);
    }

    return () => {
      // cleanup
      delete window.updateNotifications;
    };
  }, [handleUpdateNotifications]);

  /**
   * 3. 더보기 (Paging) 스크롤 시 호출
   */
  const onLoadMore = useCallback(() => {
    if (!hasMore || loading) return;

    setLoading(true);
    if (window.FlutterBridge) {
      window.FlutterBridge.postMessage(
        JSON.stringify({
          action: 'requestNotifications',
          offset: notifications.length,
          limit: 10,
        })
      );
    } else {
      setLoading(false);
    }
  }, [hasMore, loading, notifications.length]);

  /**
   * 4. 당겨서 새로고침 호출 (offset: 0)
   */
  const onRefresh = useCallback(() => {
    if (loading) return;
    setLoading(true);
    if (window.FlutterBridge) {
      window.FlutterBridge.postMessage(
        JSON.stringify({
          action: 'requestNotifications',
          offset: 0,
          limit: 10,
        })
      );
    } else {
      // 웹 단독 테스트용
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [loading]);

  /**
   * 5. 무한 스크롤 자동 로드 (IntersectionObserver)
   */
  useEffect(() => {
    const currentTarget = observerRef.current;
    if (!currentTarget || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
    };
  }, [loading, hasMore, onLoadMore]);

  /**
   * 6. FAB(위로가기) 버튼 표시를 위한 스크롤 위치 감지
   */
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      if (scrollArea.scrollTop > 100) {
        setIsFabVisible(true);
      } else {
        setIsFabVisible(false);
      }
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, []);

  const onSelectItem = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  return {
    notifications,
    loaded,
    loading,
    hasMore,
    selectedId,
    userId,
    isFabVisible,
    onRefresh,
    observerRef,
    scrollAreaRef,
    onLoadMore,
    onSelectItem,
  };
}
