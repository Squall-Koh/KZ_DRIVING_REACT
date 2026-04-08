import { useReceiptsList } from '../features/receipts/useReceiptsList';
import { ReceiptsListView } from '../features/receipts/ReceiptsListView';

export function ReceiptsList() {
  const receiptsListProps = useReceiptsList();

  return <ReceiptsListView {...receiptsListProps} />;
}
