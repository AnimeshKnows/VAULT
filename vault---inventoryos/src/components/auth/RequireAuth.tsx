import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../lib/auth/session';
import { ROUTES } from '../../lib/routes';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}

interface GuestOnlyProps {
  children: React.ReactNode;
}

/** Redirect already-authenticated users away from landing/login/signup. */
export function GuestOnly({ children }: GuestOnlyProps) {
  if (isAuthenticated()) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }
  return <>{children}</>;
}
