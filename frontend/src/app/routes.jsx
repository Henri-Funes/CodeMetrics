import { createBrowserRouter } from 'react-router-dom';
import { LayoutBase } from '../shared/components/LayoutBase';
import { RoleBasedRedirect } from './RoleBasedRedirect';
import { HomePage } from '../features/home/views/HomePage';
import { EmployeeDashboard } from '../features/employee/views/EmployeeDashboard';
import { StoreCatalog } from '../features/store/views/StoreCatalog';
import { WalletHistory } from '../features/wallet/views/WalletHistory';
import { EmployeeGoals } from '../features/goals/views/EmployeeGoals';
import { EmployeeSelfEvaluation } from '../features/evaluations/views/EmployeeSelfEvaluation';
import { AdminDashboard } from '../features/admin/views/AdminDashboard';
import { AdminRewardsManager } from '../features/admin/views/AdminRewardsManager';
import { AdminRedemptionsManager } from '../features/admin/views/AdminRedemptionsManager';
import { AdminWalletAdjustments } from '../features/admin/views/AdminWalletAdjustments';
import { AdminGoalsManager } from '../features/goals/views/AdminGoalsManager';
import { AdminEvaluationsManager } from '../features/evaluations/views/AdminEvaluationsManager';
import { GoalInspectorProvider } from '../shared/context/GoalInspectorContext.jsx';

function AppLayout() {
  return (
    <GoalInspectorProvider>
      <LayoutBase />
    </GoalInspectorProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <RoleBasedRedirect /> },
      { path: 'status', element: <HomePage /> },
      { path: 'dashboard', element: <EmployeeDashboard /> },
      { path: 'goals', element: <EmployeeGoals /> },
      { path: 'evaluations', element: <EmployeeSelfEvaluation /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/goals', element: <AdminGoalsManager /> },
      { path: 'admin/evaluations', element: <AdminEvaluationsManager /> },
      { path: 'admin/rewards', element: <AdminRewardsManager /> },
      { path: 'admin/redemptions', element: <AdminRedemptionsManager /> },
      { path: 'admin/wallet', element: <AdminWalletAdjustments /> },
      { path: 'store', element: <StoreCatalog /> },
      { path: 'wallet', element: <WalletHistory /> },
    ]
  }
]);
