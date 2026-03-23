import { useAttendanceDetail } from '../../features/attendance/useAttendanceDetail';
import { AttendanceDetailView } from '../../features/attendance/AttendanceDetailView';

export function AttendanceDetail() {
  const logic = useAttendanceDetail();
  return <AttendanceDetailView {...logic} />;
}
