import { useOperationDashboard } from '../features/dashboard/useOperationDashboard';
import { OperationDashboardView } from '../features/dashboard/OperationDashboardView';

export function OperationDashboard() {
  const logic = useOperationDashboard();
  return <OperationDashboardView {...logic} />;
}
