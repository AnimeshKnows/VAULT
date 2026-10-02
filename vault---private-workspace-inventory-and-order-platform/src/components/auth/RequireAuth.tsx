import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { ROUTES } from '../../lib/routes';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }
  return <>{children}</>;
}
