import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';

// ─── Mobile Pages ─────────────────────────────────────────────
import { Notifications }        from './pages/Notifications';
import { DrivingHistory }       from './pages/DrivingHistory';
import { Attendance }           from './pages/Attendance';
import { AttendanceDetail }     from './pages/AttendanceDetail';
import { AttendanceAdjustment } from './pages/AttendanceAdjustment';
import { Maintenance }          from './pages/Maintenance';
import { MaintenanceDetail }    from './pages/MaintenanceDetail';
import { Receipts }             from './pages/Receipts';
import { ReceiptsList }         from './pages/ReceiptsList';
import { ReceiptsHistory }      from './pages/ReceiptsHistory';

import { DailyTripHistory }     from './pages/DailyTripHistory';

import { OperationDashboard } from './pages/OperationDashboard';

import { MainLayout } from './layouts/MainLayout';

function AppRoutes() {
  useSwipeNavigation();

  return (
    <Routes>
      {/* Main Tabs (Layout with Header, NavBar, Hero) */}
      <Route element={<MainLayout />}>
        <Route path="/"                       element={<OperationDashboard />} />
        <Route path="/driving-history"        element={<DrivingHistory />} />
        <Route path="/attendance"             element={<Attendance />} />
        <Route path="/receipts"               element={<Receipts />} />
        <Route path="/maintenance"            element={<Maintenance />} />
      </Route>

      {/* Full Screen Sub Pages (No NavBar) */}
      <Route path="/notifications"          element={<Notifications />} />
      <Route path="/daily-trip-history"     element={<DailyTripHistory />} />
      <Route path="/attendance/detail"      element={<AttendanceDetail />} />
      <Route path="/attendance/adjustment"  element={<AttendanceAdjustment />} />
      <Route path="/maintenance/detail"     element={<MaintenanceDetail />} />
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
