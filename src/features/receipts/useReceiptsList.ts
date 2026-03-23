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

  const onTabChange = (newTab: TabType) => {
    setTab(newTab);
  };

  const onBack = () => {
    navigate(-1);
  };

  return {
    tab,
    onTabChange,
    corporateReceipts,
    personalReceipts,
    corporateCardInfo,
    personalCardInfo,
    onBack,
  };
}
