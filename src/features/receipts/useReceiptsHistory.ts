import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ReceiptItem } from './useReceipts';

export interface UseReceiptsHistoryReturn {
  startDate: string;
  endDate: string;
  onBack: () => void;
  // 페이징, 스크롤 데이터
  items: ReceiptItem[];
  loading: boolean;
  hasMore: boolean;
  observerRef: React.RefObject<HTMLDivElement | null>;
  onRefresh: () => void;
  onLoadMore: () => void;
}

const generateDummyHistory = (startIndex: number, count: number): ReceiptItem[] => {
  return Array.from({ length: count }).map((_, i) => {
    const idx = startIndex + i;
    const types = ['personal', 'corporate', 'simple'];
    const typeLabel = types[idx % 3] as 'personal' | 'corporate' | 'simple';
    return {
      id: `history_${idx}`,
      date: `2026.03.${String((31 - (idx % 30)) || 1).padStart(2, '0')}`,
      store: `결제 가맹점 ${idx + 1}`,
      amount: 15000 + (idx * 2500) % 200000,
      address: `서울특별시 종로구 어딘가 ${idx + 1}`,
      cardType: typeLabel === 'personal' ? 'personal' : 'corporate',
      receiptType: typeLabel,
    };
  });
};

export function useReceiptsHistory(): UseReceiptsHistoryReturn {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  // Initialize from router state
  const startDate = state?.startDate || '2026-03-01';
  const endDate = state?.endDate || '2026-03-31';

  // 페이징 상태
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback((pageNum: number, isRefresh = false) => {
    setLoading(true);
    setTimeout(() => {
      const newItems = generateDummyHistory((pageNum - 1) * 15, 15);
      
      setItems(prev => {
        if (isRefresh) return newItems;
        // 중복 방지 (React StrictMode 등)
        const existIds = new Set(prev.map(i => i.id));
        const filtered = newItems.filter(i => !existIds.has(i.id));
        return [...prev, ...filtered];
      });
      // 30개까지만 로드하도록 설정 (요청 요구사항)
      setHasMore(pageNum < 2);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    fetchItems(1, true);
  }, [fetchItems]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchItems(1, true);
  }, [fetchItems]);

  const onLoadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage);
  }, [loading, hasMore, page, fetchItems]);

  const onBack = () => {
    navigate(-1);
  };

  return {
    startDate,
    endDate,
    onBack,
    items,
    loading,
    hasMore,
    observerRef,
    onRefresh,
    onLoadMore,
  };
}
