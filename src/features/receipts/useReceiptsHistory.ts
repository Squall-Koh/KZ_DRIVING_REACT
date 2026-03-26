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

// dummy history removed

export function useReceiptsHistory(): UseReceiptsHistoryReturn {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  // Initialize from router state
  const startDate = state?.startDate || '2026-03-01';
  const endDate = state?.endDate || '2026-03-31';

  // 페이징 상태
  const [allReceipts, setAllReceipts] = useState<ReceiptItem[]>([]);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    (window as any).syncExpensesHistory = (data: any) => {
      if (data.allReceipts) {
        setAllReceipts(data.allReceipts);
        setPage(1);
        setItems(data.allReceipts.slice(0, 15));
        setHasMore(data.allReceipts.length > 15);
      }
    };

    if ((window as any).FlutterBridge) {
      const payload = JSON.stringify({
        action: 'requestReceiptsHistory',
        dateFrom: startDate,
        dateTo: endDate
      });
      (window as any).FlutterBridge.postMessage(payload);
    }
  }, [startDate, endDate, (location as any).key]);

  const fetchItems = useCallback((pageNum: number, isRefresh = false) => {
    setLoading(true);
    setTimeout(() => {
      setItems(prev => {
        const nextSlice = allReceipts.slice((pageNum - 1) * 15, pageNum * 15);
        if (isRefresh) return nextSlice;
        return [...prev, ...nextSlice];
      });
      setHasMore(pageNum * 15 < allReceipts.length);
      setLoading(false);
    }, 400);
  }, [allReceipts]);

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
