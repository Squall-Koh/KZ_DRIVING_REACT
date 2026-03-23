import { useNavigate } from 'react-router-dom';
import { useReceipts } from '../../features/receipts/useReceipts';
import { ReceiptsView } from '../../features/receipts/ReceiptsView';

export function Receipts() {
  const navigate = useNavigate();
  const receiptsProps = useReceipts();

  return (
    <ReceiptsView
      {...receiptsProps}
      onNavigate={(path: string, state?: any) => navigate(path, { state })}
    />
  );
}
