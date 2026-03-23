import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Notifications } from './pages/Notifications';
import { DrivingHistory } from './pages/DrivingHistory';
import { Attendance } from './pages/Attendance';
import { AttendanceDetail } from './pages/AttendanceDetail';
import { AttendanceAdjustment } from './pages/AttendanceAdjustment';
import { Maintenance } from './pages/Maintenance';
import { MaintenanceDetail } from './pages/MaintenanceDetail';
import { Receipts } from './pages/Receipts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/notifications" replace />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/driving-history" element={<DrivingHistory />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/detail" element={<AttendanceDetail />} />
        <Route path="/attendance/adjustment" element={<AttendanceAdjustment />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/maintenance/detail" element={<MaintenanceDetail />} />
        <Route path="/receipts" element={<Receipts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
