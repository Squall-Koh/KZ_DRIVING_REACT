import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ReceiptItem, CardInfo } from './useReceipts';

export type TabType = 'corporate' | 'personal';

export interface UseReceiptsListReturn {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
  corporateReceipts: ReceiptItem[];
  personalReceipts: ReceiptItem[];
  corporateCardInfo: CardInfo;
  personalCardInfo: CardInfo;
  selectedReceipt: ReceiptItem | null;
  purposeOptions: { label: string; value: string }[];
  slipOptions: { label: string; value: string }[];
  onSelectReceipt: (receipt: ReceiptItem) => void;
  onClosePopup: () => void;
  onBack: () => void;
}

export function useReceiptsList(): UseReceiptsListReturn {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  // Initialize from router state
  const initialTab = state?.tab || 'corporate';
  const corporateReceipts = state?.corporateReceipts || [];
  const personalReceipts = state?.personalReceipts || [];
  const corporateCardInfo = state?.corporateCardInfo || { name: '등록된 법인카드 정보 없음', number: '' };
  const personalCardInfo = state?.personalCardInfo || { name: '등록된 개인카드 정보 없음', number: '' };

  const [tab, setTab] = useState<TabType>(initialTab);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);

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
    corporateCardInfo,
    personalCardInfo,
    selectedReceipt,
    purposeOptions,
    slipOptions,
    onSelectReceipt,
    onClosePopup,
    onBack,
  };
}
