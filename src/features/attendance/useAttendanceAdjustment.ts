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

  isConfirmOpen: boolean;

  hasCommuteRecord: boolean | null;
  validationError: string | null;

  onTabChange: (t: AdjustTabType) => void;
  onWorkDateChange: (d: string) => void;
  onTimeFromChange: (t: string) => void;
  onTimeToChange: (t: string) => void;
  onRemoveFile: (index: number) => void;
  onRequestAttachment: () => void;
  onClockTargetChange: (t: 'from' | 'to' | null) => void;
  
  setValidationError: (msg: string | null) => void;
  setIsConfirmOpen: (open: boolean) => void;
  onSubmitConfirm: () => void;
  handleSubmitClick: () => void;

  onCancelAdjustment: (id: number) => void;
  onEditAdjustment: (id: number) => void;
  editId: number | null;

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

  const [hasCommuteRecord, setHasCommuteRecord] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

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

    (window as any).updateDailyTripHistory = (payload: any) => {
      try {
        const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const { attendance } = parsed;
        if (attendance && attendance.checkIn && attendance.checkIn !== '--:--') {
          setHasCommuteRecord(true);
          setTimeFrom(attendance.checkIn);
          if (attendance.checkOut && attendance.checkOut !== '--:--') {
            setTimeTo(attendance.checkOut);
          } else {
            setTimeTo(attendance.checkIn);
          }
        } else {
          setHasCommuteRecord(false);
          setTimeFrom('08:30');
          setTimeTo('17:30');
        }
      } catch (e) {
        console.error('Failed to parse daily trip history for adjustment JSON', e);
        setHasCommuteRecord(false);
      }
    };

    (window as any).updateAttendanceAdjustments = (payload: any) => {
      try {
        const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const { adjustments: fetchedList, hasMore: newHasMore, offset } = parsed;
        if (offset === 0) {
          setAdjustments(fetchedList);
        } else {
          setAdjustments((prev) => [...prev, ...fetchedList]);
        }
        setHasMore(newHasMore);
      } catch (e) {
        console.error('Failed to parse attendance adjustments JSON', e);
      } finally {
        setLoading(false);
      }
    };

    (window as any).onAttendanceAdjustmentDuplicateCheck = (isDuplicate: boolean) => {
      if (isDuplicate) {
        setValidationError('해당 날짜에 이미 등록된 근태조정 신청이 있습니다.');
      } else {
        setIsConfirmOpen(true);
      }
    };

    return () => {
      delete (window as any).onImageAttached;
      delete (window as any).updateDailyTripHistory;
      delete (window as any).updateAttendanceAdjustments;
      delete (window as any).onAttendanceAdjustmentDuplicateCheck;
    };
  }, []);

  const handleWorkDateChange = (d: string) => {
    setWorkDate(d);
    setHasCommuteRecord(null);
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({
        action: 'requestDailyTripHistory',
        payload: { date: d }
      }));
    } else {
      // 웹 임시 테스트
      setHasCommuteRecord(false);
    }
  };

  const loadData = useCallback(async (pageNum: number, isRefresh = false) => {
    setLoading(true);
    const limit = 5;
    const offset = (pageNum - 1) * limit;

    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({
        action: 'requestAttendanceAdjustments',
        payload: { limit, offset }
      }));
    } else {
      setTimeout(() => {
        if (isRefresh) setAdjustments([]);
        setHasMore(false);
        setLoading(false);
      }, 600);
    }
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

  const onCancelAdjustment = (id: number) => {
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({
        action: 'cancelAttendanceAdjustment',
        payload: { id }
      }));
      // 결재현황 리스트 reload
      setPage(1);
      loadData(1, true);
    } else {
      alert(`웹 디버그: 취소 처리됨 ID ${id}`);
    }
  };

  const onEditAdjustment = (id: number) => {
    const item = adjustments.find(a => a.id === id);
    if (!item) return;

    setEditId(id);
    setWorkDate(item.workDate);
    setTimeFrom(item.timeFrom);
    setTimeTo(item.timeTo);
    setAttachedFiles([]);
    setHasCommuteRecord(true); // 수정의 경우 이미 통과했다고 가정
    setTab('adjust');
  };

  // 모달 제어
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSubmitClick = () => {
    if (!workDate) {
      setValidationError('근무일자를 먼저 선택해주세요.');
      return;
    }
    if (hasCommuteRecord === false) {
      setValidationError('해당일에 출/퇴근 기록이 존재하지 않아 근태조정을 신청할 수 없습니다. (시간 변경 불가)');
      return;
    }
    if (!timeFrom || !timeTo) {
      setValidationError('조정 근무시간을 입력해주세요.');
      return;
    }
    if (attachedFiles.length === 0) {
      setValidationError('변경될 출/퇴근 시간에 대한 증거자료를 첨부해주세요.');
      return;
    }

    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify({
        action: 'checkAttendanceAdjustmentDuplicate',
        payload: { workDate, editId }
      }));
    } else {
      setIsConfirmOpen(true); // 웹 디버그용
    }
  };

  const onSubmitConfirm = () => {
    setIsConfirmOpen(false);
    
    if ((window as any).FlutterBridge) {
      const actionRef = editId ? 'updateAttendanceAdjustment' : 'createAttendanceAdjustment';
      const payloadRef = editId 
        ? { id: editId, workDate, timeFrom, timeTo }
        : { workDate, timeFrom, timeTo };

      (window as any).FlutterBridge.postMessage(JSON.stringify({
        action: actionRef,
        payload: payloadRef
      }));
      
      setTab('approval');
      setPage(1);
      loadData(1, true);
      
      setWorkDate('');
      setTimeFrom('08:30');
      setTimeTo('17:30');
      setAttachedFiles([]);
      setHasCommuteRecord(null);
      setEditId(null);
    } else {
      alert(`웹 디버그: ${editId ? '수정' : '등록'} 성공 (FlutterBridge 없음)`);
    }
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
    isConfirmOpen,

    hasCommuteRecord,
    validationError,

    onTabChange:        setTab,
    onWorkDateChange:   handleWorkDateChange,
    onTimeFromChange:   setTimeFrom,
    onTimeToChange:     setTimeTo,
    onRemoveFile,
    onRequestAttachment,
    onClockTargetChange: setClockTarget,
    onCancelAdjustment,
    onEditAdjustment,
    editId,
    
    setValidationError,
    setIsConfirmOpen,
    onSubmitConfirm,
    handleSubmitClick,
    
    onRefresh,
    onLoadMore,
    onBack:             () => navigate('/attendance'),
  };
}
