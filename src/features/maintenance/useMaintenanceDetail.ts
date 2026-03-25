import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── 타입 정의 ───────────────────────────────────────────────
export interface MaintenanceItem {
  id: string;
  name: string;
  elapsedKm: number;
  intervalKm: number;
}

export interface ReceiptRecord {
  id: number;
  date: string;
  shopName: string;
  amount: number;
  address: string;
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
  receipts: ReceiptRecord[];
  historyRecords: HistoryRecord[];
  isReceiptPopupOpen: boolean;
  isProcessingImage: boolean;
  onTabChange: (tab: TabType) => void;
  onDateChange: (date: string) => void;
  onAddReceiptClick: () => void;
  onCloseReceiptPopup: () => void;
  onConfirmReceipt: (data: any) => void;
  onBack: () => void;
}

// ─── Custom Hook ─────────────────────────────────────────────
export function useMaintenanceDetail(): UseMaintenanceDetailReturn {
  const navigate = useNavigate();
  const location = useLocation();

  const item: MaintenanceItem = (location.state as any)?.item ?? {
    id: 'engine_oil', name: '엔진오일', elapsedKm: 2000, intervalKm: 10000,
  };

  const [tab, setTab] = useState<TabType>('register');
  const [mainDate, setMainDate] = useState('');

  const [receipts, setReceipts] = useState<ReceiptRecord[]>(
    DUMMY_RECEIPTS[item.id] ?? DUMMY_RECEIPTS['engine_oil']
  );
  const historyRecords = DUMMY_HISTORY[item.id] ?? DUMMY_HISTORY['engine_oil'];

  const [isReceiptPopupOpen, setIsReceiptPopupOpen] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const onTabChange  = (t: TabType) => setTab(t);
  const onDateChange = (d: string)  => setMainDate(d);
  const onBack       = ()           => navigate(-1);

  // 네이티브 이미지 첨부 콜백 리스너
  useEffect(() => {
    (window as any).onImageAttached = (name: string, base64: string) => {
      // 네이티브에서 카메라/갤러리 완료 후 이미지 정보가 넘어왔을 때 호출됨
      setIsProcessingImage(false); // 혹시 로딩중이었다면 해제
      setIsReceiptPopupOpen(true);
      // 향후 base64 이미지를 폼에 프리필(pre-fill) 하거나 서버로 전송하는 로직 연결
    };
    return () => {
      delete (window as any).onImageAttached;
    };
  }, []);

  // ─── 이미지 첨부 제어 ─────────────────────────────────
  const onAddReceiptClick = () => {
    if ((window as any).FlutterBridge) {
      // 네이티브 바텀시트 호출 (경비 영수증과 동일한 로직)
      (window as any).FlutterBridge.postMessage(JSON.stringify({ action: 'requestImageAttachment' }));
    } else {
      // 웹 테스트 환경용 Fallback
      alert('모바일 앱 환경에서만 사진 첨부가 가능합니다.');
      setIsProcessingImage(true);
      setTimeout(() => {
        setIsProcessingImage(false);
        setIsReceiptPopupOpen(true);
      }, 1000);
    }
  };

  const onCloseReceiptPopup = () => setIsReceiptPopupOpen(false);

  const onConfirmReceipt = (data: any) => {
    const newReceipt: ReceiptRecord = {
      id: Date.now(),
      date: data.date,
      shopName: data.shopName,
      amount: parseInt(data.amount.replace(/[^0-9]/g, ''), 10) || 0,
      address: data.address,
    };
    setReceipts([...receipts, newReceipt]);
    setIsReceiptPopupOpen(false);
  };

  return {
    item,
    tab,
    mainDate,
    receipts,
    historyRecords,
    isReceiptPopupOpen,
    isProcessingImage,
    onTabChange,
    onDateChange,
    onAddReceiptClick,
    onCloseReceiptPopup,
    onConfirmReceipt,
    onBack,
  };
}
