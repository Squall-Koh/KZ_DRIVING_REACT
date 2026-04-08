import { useAttendanceAdjustment } from '../features/attendance/useAttendanceAdjustment';
import { AttendanceAdjustmentView } from '../features/attendance/AttendanceAdjustmentView';

export function AttendanceAdjustment() {
  const logic = useAttendanceAdjustment();
  return <AttendanceAdjustmentView {...logic} />;
}
