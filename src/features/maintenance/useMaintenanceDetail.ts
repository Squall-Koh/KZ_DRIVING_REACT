import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface MaintenanceItem {
  id: string;
  name: string;
  elapsedKm: number;
  intervalKm: number;
}

export interface AttachedFile {
  name: string;
  base64: string;
}

export interface ReceiptRecord {
  id: number;
  date: string;
  shopName: string;
  amount: number;
  address: string;
  cardType?: string;
  purpose?: string;
  slipType?: string;
}

export interface HistoryRecord {
  id: number;
  date: string;
  km: number;
  description: string;
  manager: string;
}

export type TabType = 'register' | 'history';

// ─── 더미 데이터 ─────────────────────────────────────────────
const DUMMY_RECEIPTS: Record<string, ReceiptRecord[]> = {
  engine_oil: [
    { id: 1, date: '2026.01.30', shopName: '그랑서울 카센터', amount: 130000, address: '서울특별시 종로구 종로 33' },
  ],
  air_filter: [
    { id: 1, date: '2025.11.10', shopName: '강남 자동차서비스', amount: 85000, address: '서울특별시 강남구 역삼로 12' },
  ],
};

const DUMMY_HISTORY: Record<string, HistoryRecord[]> = {
  engine_oil: [
    { id: 1, date: '2026.03.01', km: 42800, description: '합성 엔진오일 교환 및 코팅제 주입', manager: '김철수' },
    { id: 2, date: '2025.12.13', km: 33200, description: '순정 엔진오일 세트 교환', manager: '홍길동' },
    { id: 3, date: '2025.08.01', km: 24000, description: '엔진오일 교환 및 에어필터 점검', manager: '이영희' },
    { id: 4, date: '2025.03.15', km: 15500, description: '순정 엔진오일 교환', manager: '박지성' },
    { id: 5, date: '2024.11.02', km:  8000, description: '성능점검 및 최초 엔진오일 교환', manager: '김철수' },
  ],
  air_filter: [
    { id: 1, date: '2025.11.10', km: 11500, description: '에어컨 필터 교환', manager: '김민준' },
  ],
};

// ─── 반환 타입 ───────────────────────────────────────────────
export interface UseMaintenanceDetailReturn {
  item: MaintenanceItem;
  tab: TabType;
  mainDate: string;
  finalMileage: string;
  memo: string;
  receipts: ReceiptRecord[];
  historyRecords: HistoryRecord[];
  attachedFile: AttachedFile | null;
  onTabChange: (tab: TabType) => void;
  onDateChange: (date: string) => void;
  onFinalMileageChange: (mileage: string) => void;
  onMemoChange: (memo: string) => void;
  
  alertInfo: { isOpen: boolean; title: string; message: string };
  closeAlert: () => void;

  onAddReceiptClick: () => void;
  isReceiptConfirmOpen: boolean;
  setIsReceiptConfirmOpen: (open: boolean) => void;
  onConfirmAddReceipt: () => void;

  onSubmitRegistrationClick: () => void;
  isSubmitConfirmOpen: boolean;
  setIsSubmitConfirmOpen: (open: boolean) => void;
  onConfirmSubmitRegistration: () => void;

  onRemoveFile: () => void;
  onBack: () => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useMaintenanceDetail(): UseMaintenanceDetailReturn {
  const navigate = useNavigate();
  const location = useLocation();

  const item: MaintenanceItem = (location.state as any)?.item ?? {
    id: 'engine_oil', name: '엔진오일', elapsedKm: 2000, intervalKm: 10000,
  };

  // Vehicle state passed from previous screen
  const vehicle = (location.state as any)?.vehicle;

  const [tab, setTab] = useState<TabType>('register');
  const [mainDate, setMainDate] = useState('');
  
  const [finalMileage, setFinalMileage] = useState<string>(
    vehicle?.finalDistance ? vehicle.finalDistance.toLocaleString() : ''
  );
  const [memo, setMemo] = useState<string>('');

  const [alertInfo, setAlertInfo] = useState<{isOpen: boolean; title: string; message: string}>({
    isOpen: false, title: '', message: ''
  });
  const [isReceiptConfirmOpen, setIsReceiptConfirmOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  const [receipts] = useState<ReceiptRecord[]>(
    DUMMY_RECEIPTS[item.id] ?? DUMMY_RECEIPTS['engine_oil']
  );
  const historyRecords = DUMMY_HISTORY[item.id] ?? DUMMY_HISTORY['engine_oil'];

  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  const onTabChange  = (t: TabType) => setTab(t);
  const onDateChange = (d: string)  => setMainDate(d);
  const onFinalMileageChange = (m: string) => {
    const numeric = m.replace(/[^0-9]/g, '');
    setFinalMileage(numeric ? Number(numeric).toLocaleString() : '');
  };
  const onMemoChange = (text: string) => setMemo(text);
  const onBack       = ()           => navigate(-1);
  const closeAlert   = () => setAlertInfo(prev => ({ ...prev, isOpen: false }));

  // 네이티브 앱에서 발생한 에러 알림을 브릿징
  useEffect(() => {
    (window as any).showAppAlert = (msg: string) => {
      setAlertInfo({ isOpen: true, title: '알림', message: msg });
    };
    return () => {
      delete (window as any).showAppAlert;
    };
  }, []);

  // 네이티브 이미지 첨부 콜백 리스너
  useEffect(() => {
    (window as any).onImageAttached = (name: string, base64: string) => {
      setAttachedFile({ name, base64 });
    };
    return () => {
      delete (window as any).onImageAttached;
    };
  }, []);

  // ─── 이미지 첨부 제어 ─────────────────────────────────
  const onAddReceiptClick = () => {
    if (!mainDate) {
      setAlertInfo({ isOpen: true, title: '알림', message: '정비일자를 먼저 선택해주세요.' });
      return;
    }
    const parsedMileage = parseInt(finalMileage.replace(/[^0-9]/g, ''), 10);
    if (!finalMileage || isNaN(parsedMileage) || parsedMileage === 0) {
      setAlertInfo({ isOpen: true, title: '알림', message: '최종 주행거리를 입력해주세요.' });
      return;
    }

    if (!memo.trim()) {
      setAlertInfo({ isOpen: true, title: '알림', message: '정비 내용을 입력해주세요.' });
      return;
    }

    setIsReceiptConfirmOpen(true);
  };

  const onConfirmAddReceipt = () => {
    setIsReceiptConfirmOpen(false);
    if ((window as any).FlutterBridge) {
      // 네이티브 바텀시트 호출 (경비 영수증과 동일한 로직)
      (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'requestImageAttachment' }));
    } else {
      // 웹 테스트 환경용 Fallback
      setAlertInfo({ isOpen: true, title: '알림', message: '모바일 앱 환경에서만 사진 첨부가 가능합니다.' });
      setAttachedFile({ name: 'mock_receipt.png', base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' });
    }
  };

  const onRemoveFile = () => setAttachedFile(null);

  const onSubmitRegistrationClick = () => {
    if (!finalMileage) {
      setAlertInfo({ isOpen: true, title: '알림', message: '최종 주행거리를 입력해주세요.' });
      return;
    }

    if (!memo.trim()) {
      setAlertInfo({ isOpen: true, title: '알림', message: '정비 내용을 입력해주세요.' });
      return;
    }

    setIsSubmitConfirmOpen(true);
  };

  const onConfirmSubmitRegistration = () => {
    setIsSubmitConfirmOpen(false);

    const parsedOdometer = parseInt(finalMileage.replace(/[^0-9]/g, ''), 10);

    // "2026.03.27" 포맷 -> "2026-03-27" ISO 포맷으로 변환 (DB 날짜 비교 일관성)
    const isoDate = mainDate ? mainDate.replace(/\./g, '-') : new Date().toISOString().split('T')[0];

    const payload = {
      action: 'createMaintenanceHistory',
      driverId: 'driver_tester', // Default driver
      vehicleId: Number(location.state?.vehicle?.id ?? 1),
      itemId: item.id,
      maintenanceDate: isoDate,
      odometerKm: parsedOdometer,
      cost: attachedFile ? 130000 : 0,
      shopName: attachedFile ? '그랑서울 카센터' : '',
      receiptImagePath: attachedFile ? attachedFile.base64 : null,
      memo: memo.trim(),
    };

    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(JSON.stringify(payload));
    } else {
      console.log('Web environment simulated post:', payload);
      setAlertInfo({ isOpen: true, title: '알림', message: '정비 이력 등록 중 오류가 발생했습니다.' }); // Web fallback
    }

    setAlertInfo({ isOpen: true, title: '알림', message: '정비가 등록되었습니다.' });
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  return {
    item,
    tab,
    mainDate,
    finalMileage,
    memo,
    receipts,
    historyRecords,
    attachedFile,
    onTabChange,
    onDateChange,
    onFinalMileageChange,
    onMemoChange,
    alertInfo,
    closeAlert,
    onAddReceiptClick,
    isReceiptConfirmOpen,
    setIsReceiptConfirmOpen,
    onConfirmAddReceipt,
    onSubmitRegistrationClick,
    isSubmitConfirmOpen,
    setIsSubmitConfirmOpen,
    onConfirmSubmitRegistration,
    onRemoveFile,
    onBack,
  };
}
