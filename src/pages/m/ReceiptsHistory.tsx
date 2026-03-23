import { useReceiptsHistory } from '../../features/receipts/useReceiptsHistory';
import { ReceiptsHistoryView } from '../../features/receipts/ReceiptsHistoryView';

export function ReceiptsHistory() {
  const historyProps = useReceiptsHistory();

  return <ReceiptsHistoryView {...historyProps} />;
}
