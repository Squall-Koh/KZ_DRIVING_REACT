import { useAttendance } from '../features/attendance/useAttendance';
import { AttendanceView } from '../features/attendance/AttendanceView';

export function Attendance() {
  const logic = useAttendance();
  return <AttendanceView {...logic} />;
}
