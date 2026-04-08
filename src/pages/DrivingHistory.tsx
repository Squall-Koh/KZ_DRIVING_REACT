import { useDrivingHistory } from '../features/drivingHistory/useDrivingHistory';
import { DrivingHistoryView } from '../features/drivingHistory/DrivingHistoryView';

export function DrivingHistory() {
  const logic = useDrivingHistory();
  return <DrivingHistoryView {...logic} />;
}
