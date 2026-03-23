import { useMaintenance } from '../../features/maintenance/useMaintenance';
import { MaintenanceView } from '../../features/maintenance/MaintenanceView';

export function Maintenance() {
  const logic = useMaintenance();
  return <MaintenanceView {...logic} />;
}
