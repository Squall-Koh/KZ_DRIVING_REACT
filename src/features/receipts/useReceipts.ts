import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ReceiptItem {
  id: string;
  date: string;
  store: string;
  amount: number;
  address: string;
  cardType: 'corporate' | 'personal';
  receiptType?: 'simple' | 'corporate' | 'personal';
}

export interface CardInfo {
  name: string;
  number: string;
}

export interface UseReceiptsReturn {
  bridge: {
    userName: string;
    isVehicleConnected: boolean;
    plateNumber: string;
    vehicleName: string;
    connectionStatus: string;
  };
  expenseStatus: {
    period: string;
    totalAmount: number;
  };
  receiptsToProcess: {
    corporateCount: number;
    personalCount: number;
  };
  corporateCards: CardInfo[];
  personalCards: CardInfo[];
  corporateReceipts: ReceiptItem[];
  personalReceipts: ReceiptItem[];
  recentExpenses: ReceiptItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onNavigate: (path: string, state?: any) => void;
  // Date Picker State
  showDatePicker: boolean;
  startDate: string;
  endDate: string;
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  onConfirmDateRange: (start: string, end: string) => void;
  isManualPopupOpen: boolean;
  onOpenManualPopup: () => void;
  onCloseManualPopup: () => void;
}

export function useReceipts(): UseReceiptsReturn {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [startDate, setStartDate] = useState<string>('2026-03-01');
  const [endDate, setEndDate] = useState<string>('2026-03-31');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isManualPopupOpen, setIsManualPopupOpen] = useState<boolean>(false);

  // 초깃값 없음 - Flutter에서 window.updateReceiptsInfo()로 주입받음
  const [bridge, setBridge] = useState({
    userName: '',
    isVehicleConnected: false,
    plateNumber: '',
    vehicleName: '',
    connectionStatus: '연결 대기중',
  });

  useEffect(() => {
    (window as any).updateReceiptsInfo = (data: Partial<typeof bridge>) =>
      setBridge((p) => ({ ...p, ...data }));
    if ((window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage('requestDriverInfo');
    }
  }, []);

  const expenseStatus = {
    period: `${startDate.replace(/-/g, '.')} ~ ${endDate.replace(/-/g, '.')}`,
    totalAmount: 0,
  };

  const receiptsToProcess = {
    corporateCount: 0,
    personalCount: 0,
  };

  const corporateCards: CardInfo[] = [
    { name: '현대카드 (법인)', number: '4056-9100-****-4606' },
    { name: '삼성카드 (법인)', number: '1234-5678-****-9012' }
  ];

  const personalCards: CardInfo[] = [
    { name: '신한카드 (개인)', number: '9876-5432-****-1234' },
    { name: '국민카드 (개인)', number: '1111-2222-****-3333' }
  ];

  const [corporateReceipts, setCorporateReceipts] = useState<ReceiptItem[]>([]);
  const [personalReceipts, setPersonalReceipts] = useState<ReceiptItem[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<ReceiptItem[]>([]);

  const onNavigate = (path: string, state?: any) => {
    navigate(path, { state });
  };

  const onOpenDatePicker = () => setShowDatePicker(true);
  const onCloseDatePicker = () => setShowDatePicker(false);
  const onConfirmDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setShowDatePicker(false);
    navigate('/receipts/history', { state: { startDate: start, endDate: end } });
  };

  return {
    bridge,
    expenseStatus,
    receiptsToProcess,
    corporateCards,
    personalCards,
    corporateReceipts,
    personalReceipts,
    recentExpenses,
    scrollRef,
    onNavigate,
    showDatePicker,
    startDate,
    endDate,
    onOpenDatePicker,
    onCloseDatePicker,
    onConfirmDateRange,
    isManualPopupOpen,
    onOpenManualPopup: () => setIsManualPopupOpen(true),
    onCloseManualPopup: () => setIsManualPopupOpen(false),
  };
}
