import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ReceiptItem, CardInfo } from './useReceipts';

export type TabType = 'corporate' | 'personal';

export interface UseReceiptsListReturn {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
  corporateReceipts: ReceiptItem[];
  personalReceipts: ReceiptItem[];
  corporateCards: CardInfo[];
  personalCards: CardInfo[];
  selectedReceipt: ReceiptItem | null;
  purposeOptions: { label: string; value: string }[];
  slipOptions: { label: string; value: string }[];
  onSelectReceipt: (receipt: ReceiptItem) => void;
  onClosePopup: () => void;
  onBack: () => void;
  
  // 무한 스크롤 & PTR 추가
  loading: boolean;
  hasMore: boolean;
  isRefreshing: boolean;
  isFabVisible: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  observerRef: React.RefObject<HTMLDivElement | null>;
  onRefresh: () => void;
  scrollToTop: () => void;
  activeCardIndex: number;
  setActiveCardIndex: (v: number) => void;
  filteredReceipts: ReceiptItem[];
}

export function useReceiptsList(): UseReceiptsListReturn {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  // Initialize from router state
  const initialTab = state?.tab || 'corporate';
  const corporateReceipts = state?.corporateReceipts || [];
  const personalReceipts = state?.personalReceipts || [];
  const corporateCards = state?.corporateCards || [];
  const personalCards = state?.personalCards || [];

  const [tab, setTab] = useState<TabType>(initialTab);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    setActiveCardIndex(0);
    setPage(1);
  }, [tab]);

  const activeCards = tab === 'corporate' ? corporateCards : personalCards;
  const rawReceipts = tab === 'corporate' ? corporateReceipts : personalReceipts;
  const activeCard = activeCards.length > activeCardIndex ? activeCards[activeCardIndex] : null;

  const allFilteredReceipts = activeCard 
    ? rawReceipts.filter((r: any) => r.cardName === activeCard.name)
    : [];

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFabVisible, setIsFabVisible] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const limit = 15;
  const filteredReceipts = allFilteredReceipts.slice(0, page * limit);
  const hasMore = page * limit < allFilteredReceipts.length;

  const loadData = useCallback(async (pageNum: number, isRefresh = false) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // fake delay
    setLoading(false);
    if (isRefresh) setIsRefreshing(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadData(1, true);
  }, [tab, activeCardIndex, loadData]);

  const onRefresh = useCallback(() => {
    if (loading) return;
    setIsRefreshing(true);
    setPage(1);
    loadData(1, true);
  }, [loading, loadData]);

  const onLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, false);
  }, [hasMore, loading, page, loadData]);

  // IntersectionObserver for infinite scroll
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
    return () => observer.unobserve(currentTarget);
  }, [loading, hasMore, onLoadMore]);

  // FAB 
  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      setIsFabVisible(scrollArea.scrollTop > 100);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, [tab]); // tab 변경 시에도 체크

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Mock API options
  const [purposeOptions] = useState([
    { label: '수행기사 식대 결제', value: 'meal' },
    { label: '수행차량 주유비 결제', value: 'fuel' },
    { label: '수행차량 비품 구매', value: 'supplies' },
    { label: '수행차량 경·정비 결제', value: 'maintenance' },
    { label: '수행차량 주차비 결제', value: 'parking' },
    { label: '기타지출', value: 'other' },
  ]);

  const [slipOptions] = useState([
    { label: '매입전표', value: 'purchase' },
    { label: '기타전표', value: 'other' },
  ]);

  const onTabChange = (newTab: TabType) => {
    setTab(newTab);
  };

  const onSelectReceipt = (receipt: ReceiptItem) => {
    setSelectedReceipt(receipt);
  };

  const onClosePopup = () => {
    setSelectedReceipt(null);
  };

  const onBack = () => {
    if (selectedReceipt) {
      setSelectedReceipt(null);
      return;
    }
    navigate(-1);
  };

  return {
    tab,
    onTabChange,
    corporateReceipts,
    personalReceipts,
    corporateCards,
    personalCards,
    selectedReceipt,
    purposeOptions,
    slipOptions,
    onSelectReceipt,
    onClosePopup,
    onBack,

    loading,
    hasMore,
    isRefreshing,
    isFabVisible,
    scrollRef,
    observerRef,
    onRefresh,
    scrollToTop,
    activeCardIndex,
    setActiveCardIndex,
    filteredReceipts,
  };
}
