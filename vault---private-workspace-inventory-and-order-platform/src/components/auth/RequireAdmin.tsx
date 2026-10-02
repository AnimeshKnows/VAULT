import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../../utils/auth';
import { ROUTES } from '../../lib/routes';
import { useToast } from '../ui';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { pushToast } = useToast();
  const role = getStoredUser()?.role;
  const notified = useRef(false);

  useEffect(() => {
    if (role !== 'Admin' && !notified.current) {
      notified.current = true;
      pushToast({
        title: 'Access denied',
        message: 'You do not have access to that page.',
        tone: 'warning',
      });
    }
  }, [role, pushToast]);

  if (role !== 'Admin') {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}
