import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';

// ─── Mobile Pages ─────────────────────────────────────────────
import { Notifications }        from './pages/m/Notifications';
import { DrivingHistory }       from './pages/m/DrivingHistory';
import { Attendance }           from './pages/m/Attendance';
import { AttendanceDetail }     from './pages/m/AttendanceDetail';
import { AttendanceAdjustment } from './pages/m/AttendanceAdjustment';
import { Maintenance }          from './pages/m/Maintenance';
import { MaintenanceDetail }    from './pages/m/MaintenanceDetail';
import { Receipts }             from './pages/m/Receipts';
import { ReceiptsList }         from './pages/m/ReceiptsList';
import { ReceiptsHistory }      from './pages/m/ReceiptsHistory';

// ─── Web Pages ────────────────────────────────────────────────
import { MainPage } from './pages/web/MainPage';
import { OperationDashboard } from './pages/m/OperationDashboard';

function AppRoutes() {
  useSwipeNavigation();

  return (
    <Routes>
      {/* Web / Desktop Intro */}
      <Route path="/intro"    element={<MainPage />} />

      {/* Mobile (Flutter WebView) */}
      <Route path="/"                       element={<OperationDashboard />} />
      <Route path="/notifications"          element={<Notifications />} />
      <Route path="/driving-history"        element={<DrivingHistory />} />
      <Route path="/attendance"             element={<Attendance />} />
      <Route path="/attendance/detail"      element={<AttendanceDetail />} />
      <Route path="/attendance/adjustment"  element={<AttendanceAdjustment />} />
      <Route path="/maintenance"            element={<Maintenance />} />
      <Route path="/maintenance/detail"     element={<MaintenanceDetail />} />
      <Route path="/receipts"               element={<Receipts />} />
      <Route path="/receipts/list"          element={<ReceiptsList />} />
      <Route path="/receipts/history"       element={<ReceiptsHistory />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
