import { useDailyTripHistory } from '../features/dailyTripHistory/useDailyTripHistory';
import { DailyTripHistoryView } from '../features/dailyTripHistory/DailyTripHistoryView';

export function DailyTripHistory() {
  const logic = useDailyTripHistory();
  return <DailyTripHistoryView {...logic} />;
}
