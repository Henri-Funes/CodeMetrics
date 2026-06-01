import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LayoutBase } from '../shared/components/LayoutBase';
import { EmployeeDashboard } from '../features/employee/views/EmployeeDashboard';
import { StoreCatalog } from '../features/store/views/StoreCatalog';
import { WalletHistory } from '../features/wallet/views/WalletHistory';
import { AdminDashboard } from '../features/admin/views/AdminDashboard';
import { AdminRewardsManager } from '../features/admin/views/AdminRewardsManager';
import { AdminRedemptionsManager } from '../features/admin/views/AdminRedemptionsManager';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutBase />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <EmployeeDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/rewards', element: <AdminRewardsManager /> },
      { path: 'admin/redemptions', element: <AdminRedemptionsManager /> },
      { path: 'store', element: <StoreCatalog /> },
      { path: 'wallet', element: <WalletHistory /> },
    ]
  }
]);
