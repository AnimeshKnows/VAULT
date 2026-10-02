import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { NavigationPage } from '../types';
import { pageFromPath, pathForPage } from '../lib/routes';

/**
 * Bridge for existing onNavigate(page) call sites → React Router.
 */
export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage: NavigationPage = useMemo(
    () => pageFromPath(location.pathname) ?? 'landing',
    [location.pathname]
  );

  const onNavigate = useCallback(
    (page: NavigationPage) => {
      navigate(pathForPage(page));
    },
    [navigate]
  );

  return { navigate, currentPage, onNavigate, location };
}
