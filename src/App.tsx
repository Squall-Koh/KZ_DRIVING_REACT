import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ─── Mobile Pages ─────────────────────────────────────────────
import { Notifications }        from './pages/m/Notifications';
import { DrivingHistory }       from './pages/m/DrivingHistory';
import { Attendance }           from './pages/m/Attendance';
import { AttendanceDetail }     from './pages/m/AttendanceDetail';
import { AttendanceAdjustment } from './pages/m/AttendanceAdjustment';
import { Maintenance }          from './pages/m/Maintenance';
import { MaintenanceDetail }    from './pages/m/MaintenanceDetail';
import { Receipts }             from './pages/m/Receipts';

// ─── Web Pages ────────────────────────────────────────────────
import { MainPage } from './pages/web/MainPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Web */}
        <Route path="/"    element={<MainPage />} />

        {/* Mobile (Flutter WebView) */}
        <Route path="/notifications"          element={<Notifications />} />
        <Route path="/driving-history"        element={<DrivingHistory />} />
        <Route path="/attendance"             element={<Attendance />} />
        <Route path="/attendance/detail"      element={<AttendanceDetail />} />
        <Route path="/attendance/adjustment"  element={<AttendanceAdjustment />} />
        <Route path="/maintenance"            element={<Maintenance />} />
        <Route path="/maintenance/detail"     element={<MaintenanceDetail />} />
        <Route path="/receipts"               element={<Receipts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
