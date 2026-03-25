import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── 타입 ────────────────────────────────────────────────────
export interface AdjustmentRecord {
  id: number;
  submitDate: string;
  workDate: string;
  timeFrom: string;
  timeTo: string;
  status: '결재대기' | '결재완료' | '결재반려';
}

export type AdjustTabType = 'adjust' | 'approval';

const DUMMY_ADJUSTMENTS: AdjustmentRecord[] = Array.from({ length: 15 }).map((_, i) => {
  const isPending = i % 3 === 0;
  const isRejected = i % 3 === 2 && i !== 0; // 일부러 결재반려도 섞음
  return {
    id: i + 1,
    submitDate: `2026.03.${(30 - i).toString().padStart(2, '0')}`,
    workDate: `2026.03.${(29 - i).toString().padStart(2, '0')}`,
    timeFrom: '08:30',
    timeTo: '17:30',
    status: isPending ? '결재대기' : (isRejected ? '결재반려' : '결재완료'),
  };
});

export const STATUS_STYLE: Record<string, React.CSSProperties> = {
  '결재대기': { color: '#2563eb', backgroundColor: '#eff6ff' },
  '결재완료': { color: '#16a34a', backgroundColor: '#f0fdf4' },
  '결재반려': { color: '#dc2626', backgroundColor: '#fef2f2' },
};

// ─── 반환 타입 ───────────────────────────────────────────────
export interface AttachedFile {
  name: string;
  base64: string;
  sizeKb: number;
}

export interface UseAttendanceAdjustmentReturn {
  tab: AdjustTabType;
  workDate: string;
  timeFrom: string;
  timeTo: string;
  attachedFiles: AttachedFile[];
  clockTarget: 'from' | 'to' | null;
  adjustments: AdjustmentRecord[];
  
  loading: boolean;
  hasMore: boolean;
  isFabVisible: boolean;
  observerRef: React.RefObject<HTMLDivElement | null>;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  snackbarMessage: string | null;

  isConfirmOpen: boolean;

  onTabChange: (t: AdjustTabType) => void;
  onWorkDateChange: (d: string) => void;
  onTimeFromChange: (t: string) => void;
  onTimeToChange: (t: string) => void;
  onRemoveFile: (index: number) => void;
  onRequestAttachment: () => void;
  onClockTargetChange: (t: 'from' | 'to' | null) => void;
  
  setIsConfirmOpen: (open: boolean) => void;
  onSubmitConfirm: () => void;

  onRefresh: () => void;
  onLoadMore: () => void;
  onBack: () => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useAttendanceAdjustment(): UseAttendanceAdjustmentReturn {
  const navigate = useNavigate();

  const [tab, setTab]               = useState<AdjustTabType>('adjust');
  const [workDate, setWorkDate]     = useState('');
  const [timeFrom, setTimeFrom]     = useState('08:30');
  const [timeTo, setTimeTo]         = useState('17:30');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [clockTarget, setClockTarget] = useState<'from' | 'to' | null>(null);

  // 스크롤 및 페이징 상태
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFabVisible, setIsFabVisible] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).onImageAttached = (name: string, base64: string) => {
      // 대략적인 파일 사이즈(KB) 계산
      let sizeBytes = Math.floor(base64.length * 0.75);
      if (base64.endsWith('==')) sizeBytes -= 2;
      else if (base64.endsWith('=')) sizeBytes -= 1;
      const sizeKb = Math.floor(sizeBytes / 1024);

      setAttachedFiles((prev) => [...prev, { name, base64, sizeKb }]);
    };
    return () => {
      delete (window as any).onImageAttached;
    };
  }, []);

  // 15개 더미 데이터 페이징 흉내
  const loadData = useCallback(async (pageNum: number, isRefresh = false) => {
    setLoading(true);
    // 가짜 네트워크 딜레이
    await new Promise(r => setTimeout(r, 600)); 

    const limit = 5;
    const offset = (pageNum - 1) * limit;
    const nextData = DUMMY_ADJUSTMENTS.slice(offset, offset + limit);

    if (isRefresh) {
      setAdjustments(nextData);
    } else {
      setAdjustments(prev => [...prev, ...nextData]);
    }

    setHasMore(offset + limit < DUMMY_ADJUSTMENTS.length);
    setLoading(false);
  }, []);

  // 탭이 바뀔 때 결재현황이면 첫 페이지 로드
  useEffect(() => {
    if (tab === 'approval' && adjustments.length === 0) {
      setPage(1);
      loadData(1, true);
    }
  }, [tab, adjustments.length, loadData]);

  const onRefresh = useCallback(() => {
    if (loading) return;
    setPage(1);
    loadData(1, true);
  }, [loading, loadData]);

  const onLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, false);
  }, [hasMore, loading, page, loadData]);

  // Observer
  useEffect(() => {
    const currentTarget = observerRef.current;
    if (!currentTarget || loading || !hasMore || tab !== 'approval') return;

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
  }, [loading, hasMore, tab, onLoadMore]);

  // FAB 
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea || tab !== 'approval') return;

    const handleScroll = () => {
      setIsFabVisible(scrollArea.scrollTop > 100);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, [tab]);

  const onRequestAttachment = () => {
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'requestImageAttachment' }));
    } else {
      alert('모바일 앱 환경에서만 사진 첨부가 가능합니다.');
    }
  };

  const onRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showSnackbar = useCallback((msg: string) => {
    setSnackbarMessage(msg);
    setTimeout(() => {
      setSnackbarMessage(null);
    }, 3000);
  }, []);

  // 모달 제어
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const onSubmitConfirm = () => {
    setIsConfirmOpen(false);
    showSnackbar('근태조정 신청이 완료되었습니다.');
    setTab('approval');
    // 실제 API 연동은 이곳에 추가
  };

  return {
    tab,
    workDate,
    timeFrom,
    timeTo,
    attachedFiles,
    clockTarget,
    adjustments,
    
    loading,
    hasMore,
    isFabVisible,
    observerRef,
    scrollAreaRef,
    snackbarMessage,
    isConfirmOpen,

    onTabChange:        setTab,
    onWorkDateChange:   setWorkDate,
    onTimeFromChange:   setTimeFrom,
    onTimeToChange:     setTimeTo,
    onRemoveFile,
    onRequestAttachment,
    onClockTargetChange: setClockTarget,
    setIsConfirmOpen,
    onSubmitConfirm,
    
    onRefresh,
    onLoadMore,
    onBack:             () => navigate('/attendance'),
  };
}
