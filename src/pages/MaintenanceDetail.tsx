import { useMaintenanceDetail } from '../features/maintenance/useMaintenanceDetail';
import { MaintenanceDetailView } from '../features/maintenance/MaintenanceDetailView';

export function MaintenanceDetail() {
  const logic = useMaintenanceDetail();
  return <MaintenanceDetailView {...logic} />;
}
