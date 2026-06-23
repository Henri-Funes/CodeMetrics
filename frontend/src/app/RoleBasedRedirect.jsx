import { Navigate } from 'react-router-dom';

import { useAuth } from './AuthContext';

export function RoleBasedRedirect() {
  const { currentUser } = useAuth();
  const target = currentUser.role === 'admin' ? '/admin' : '/dashboard';

  return <Navigate to={target} replace />;
}
