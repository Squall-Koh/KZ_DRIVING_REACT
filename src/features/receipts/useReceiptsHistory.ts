import { useLocation, useNavigate } from 'react-router-dom';
import type { ReceiptItem } from './useReceipts';

export interface UseReceiptsHistoryReturn {
  recentExpenses: ReceiptItem[];
  startDate: string;
  endDate: string;
  onBack: () => void;
}

export function useReceiptsHistory(): UseReceiptsHistoryReturn {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  // Initialize from router state
  const recentExpenses = state?.recentExpenses || [];
  const startDate = state?.startDate || '2026-03-01';
  const endDate = state?.endDate || '2026-03-31';

  const onBack = () => {
    navigate(-1);
  };

  return {
    recentExpenses,
    startDate,
    endDate,
    onBack,
  };
}
