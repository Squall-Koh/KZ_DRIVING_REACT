import { useState, useRef } from 'react';

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
  };
  expenseStatus: {
    period: string;
    totalAmount: number;
  };
  receiptsToProcess: {
    corporateCount: number;
    personalCount: number;
  };
  corporateCardInfo: CardInfo;
  personalCardInfo: CardInfo;
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
}

export function useReceipts(): UseReceiptsReturn {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [startDate, setStartDate] = useState<string>('2026-03-01');
  const [endDate, setEndDate] = useState<string>('2026-03-31');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Mock data
  const [bridge] = useState({
    userName: '강무호',
    isVehicleConnected: true,
    plateNumber: '123 허 4567',
    vehicleName: '카니발 하이리무진',
  });

  const expenseStatus = {
    period: `${startDate.replace(/-/g, '.')} ~ ${endDate.replace(/-/g, '.')}`,
    totalAmount: 360000,
  };

  const [receiptsToProcess] = useState({
    corporateCount: 10,
    personalCount: 4,
  });

  const [corporateCardInfo] = useState<CardInfo>({
    name: '현대카드 (법인)',
    number: '4056-9100-****-4606',
  });

  const [personalCardInfo] = useState<CardInfo>({
    name: '삼성카드 (개인)',
    number: '1234-5678-****-9012',
  });

  const [corporateReceipts] = useState<ReceiptItem[]>([
    { id: 'c1', date: '2026.01.30', store: '그랑서울 카센터', amount: 130000, address: '서울특별시 종로구 종로 33', cardType: 'corporate' },
    { id: 'c2', date: '2026.01.30', store: '그랑서울 카센터 (수리)', amount: 130000, address: '서울특별시 종로구 종로 33', cardType: 'corporate' },
    { id: 'c3', date: '2026.01.30', store: '그랑서울 카센터 (부품)', amount: 130000, address: '서울특별시 종로구 종로 33', cardType: 'corporate' },
    { id: 'c4', date: '2026.01.30', store: '그랑서울 카센터 (세차)', amount: 130000, address: '서울특별시 종로구 종로 33', cardType: 'corporate' },
    { id: 'c5', date: '2026.01.29', store: 'SK 주유소', amount: 80000, address: '서울특별시 서초구 반포동', cardType: 'corporate' },
    { id: 'c6', date: '2026.01.28', store: '이마트', amount: 45000, address: '서울특별시 마포구 성산동', cardType: 'corporate' },
    { id: 'c7', date: '2026.01.27', store: '스타벅스', amount: 12000, address: '서울특별시 강남구 테헤란로', cardType: 'corporate' },
    { id: 'c8', date: '2026.01.26', store: '교보문고', amount: 25000, address: '서울특별시 종로구 종로 1', cardType: 'corporate' },
    { id: 'c9', date: '2026.01.25', store: '우체국', amount: 8000, address: '서울특별시 용산구 한강대로', cardType: 'corporate' },
    { id: 'c10', date: '2026.01.24', store: '공영주차장', amount: 15000, address: '서울특별시 중구 명동', cardType: 'corporate' },
  ]);

  const [personalReceipts] = useState<ReceiptItem[]>([
    { id: 'p1', date: '2026.01.30', store: '개인 식당', amount: 15000, address: '서울특별시 강남구 역삼동', cardType: 'personal' },
    { id: 'p2', date: '2026.01.29', store: '편의점', amount: 5000, address: '서울특별시 강동구 천호동', cardType: 'personal' },
    { id: 'p3', date: '2026.01.28', store: '다이소', amount: 10000, address: '서울특별시 송파구 잠실동', cardType: 'personal' },
    { id: 'p4', date: '2026.01.27', store: '커피빈', amount: 6500, address: '서울특별시 영등포구 여의도동', cardType: 'personal' },
  ]);

  const [recentExpenses] = useState<ReceiptItem[]>([
    { id: '1', date: '26.03.01', store: 'CU 편의점 종각역점', amount: 54000, address: '서울특별시 종로구 종로 33', cardType: 'corporate', receiptType: 'simple' },
    { id: '2', date: '26.02.28', store: '그랑서울 카센터', amount: 130000, address: '서울특별시 종로구 종로 33', cardType: 'corporate', receiptType: 'corporate' },
    { id: '3', date: '26.02.27', store: '이마트 왕십리점', amount: 95000, address: '서울특별시 성동구 왕십리광장로 17', cardType: 'personal', receiptType: 'personal' },
    { id: '4', date: '26.02.27', store: '스타벅스 시청점', amount: 12000, address: '서울특별시 중구 세종대로', cardType: 'corporate', receiptType: 'simple' },
    { id: '5', date: '26.02.27', store: 'SK 주유소 서울시청역', amount: 80000, address: '서울특별시 중구 서소문로', cardType: 'corporate', receiptType: 'corporate' },
    { id: '6', date: '26.02.26', store: '교보문고 광화문점', amount: 25000, address: '서울특별시 종로구 종로 1', cardType: 'personal', receiptType: 'personal' },
    { id: '7', date: '26.02.25', store: '다이소 종각역점', amount: 18000, address: '서울특별시 종로구 종로 12', cardType: 'corporate', receiptType: 'simple' },
    { id: '8', date: '26.02.24', store: 'GS25 역삼점', amount: 5000, address: '서울특별시 강남구 역삼로', cardType: 'corporate', receiptType: 'corporate' },
    { id: '9', date: '26.02.23', store: '신세계백화점', amount: 350000, address: '서울특별시 중구 소공로 63', cardType: 'personal', receiptType: 'personal' },
    { id: '10', date: '26.02.22', store: '할리스커피', amount: 6500, address: '서울특별시 강남구 봉은사로', cardType: 'corporate', receiptType: 'simple' },
    { id: '11', date: '26.02.21', store: '세븐일레븐', amount: 9000, address: '서울특별시 마포구 월드컵북로', cardType: 'corporate', receiptType: 'corporate' },
    { id: '12', date: '26.02.20', store: 'CGV 여의도', amount: 30000, address: '서울특별시 영등포구 국제금융로', cardType: 'personal', receiptType: 'personal' },
    { id: '13', date: '26.02.19', store: '올리브영', amount: 45000, address: '서울특별시 서초구 서초대로', cardType: 'corporate', receiptType: 'simple' },
    { id: '14', date: '26.02.18', store: '파리바게뜨', amount: 15000, address: '서울특별시 강동구 천호대로', cardType: 'corporate', receiptType: 'corporate' },
    { id: '15', date: '26.02.17', store: '홈플러스 합정점', amount: 120000, address: '서울특별시 마포구 양화로 45', cardType: 'personal', receiptType: 'personal' },
  ]);

  const onNavigate = (path: string, state?: any) => {
    // Navigation logic here, handled by parent typically
    console.log('Navigate to:', path, state);
  };

  const onOpenDatePicker = () => setShowDatePicker(true);
  const onCloseDatePicker = () => setShowDatePicker(false);
  const onConfirmDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setShowDatePicker(false);
  };

  return {
    bridge,
    expenseStatus,
    receiptsToProcess,
    corporateCardInfo,
    personalCardInfo,
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
  };
}
