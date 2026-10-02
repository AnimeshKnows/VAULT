import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Lenis from 'lenis';
import { Loader } from './components/Loader';
import { HeaderNav } from './components/HeaderNav';
import { PushDownMenu } from './components/PushDownMenu';
import { Hero } from './components/Hero';
import { FactsBlock } from './components/FactsBlock';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { ModulesDial } from './components/ModulesDial';
import { SecuritySection } from './components/SecuritySection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { PrinciplesSection } from './components/PrinciplesSection';
import { StackWheel } from './components/StackWheel';
import { PreFooterCta } from './components/PreFooterCta';
import { Footer } from './components/Footer';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { ToastProvider } from './components/ui';
import { RequireAuth, GuestOnly } from './components/auth/RequireAuth';
import { RequireAdmin } from './components/auth/RequireAdmin';
import { AppShell } from './components/layout/AppShell';
import { WorkspaceProvider } from './context/WorkspaceProvider';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { StockLogPage } from './pages/StockLogPage';
import { UsersPage } from './pages/UsersPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ROUTES } from './lib/routes';

// Marketing landing page with Push-Down Reveal Menu
function MarketingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const lenisRef = useRef<Lenis | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLButtonElement | null>(null);

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (isReducedMotion) return;

    let lenisInstance: Lenis | null = null;
    try {
      lenisInstance = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenisRef.current = lenisInstance;

      let animationFrameId: number;
      const raf = (time: number) => {
        lenisInstance?.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      };
      animationFrameId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(animationFrameId);
        lenisInstance?.destroy();
        lenisRef.current = null;
      };
    } catch {
      // Fallback
    }
  }, [isReducedMotion]);

  // Lock scroll while menu is open and restore upon close
  useEffect(() => {
    if (isMenuOpen) {
      lenisRef.current?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenisRef.current?.start();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  // Navigate to section with close animation first
  const handleNavigateSection = (sectionId: string) => {
    setIsMenuOpen(false);
    const delay = isReducedMotion ? 200 : 720;
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(el);
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, delay);
  };

  // Navigate to route with close animation first
  const handleNavigateRoute = (route: string) => {
    setIsMenuOpen(false);
    const delay = isReducedMotion ? 200 : 720;
    setTimeout(() => {
      navigate(route);
    }, delay);
  };

  // Page wrapper animation variants
  // Push-down reveal: translates down ~62vh (70vh mobile), scale to 0.96, top corners radius to 20px, brightness 0.7
  const pageVariants = {
    closed: {
      y: 0,
      scale: 1,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      filter: 'brightness(1)',
      transition: {
        duration: isReducedMotion ? 0.2 : 0.7,
        ease: [0.76, 0, 0.24, 1] as const,
      },
    },
    open: {
      y: isMobile ? '70vh' : '62vh',
      scale: 0.96,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      filter: 'brightness(0.7)',
      transition: {
        duration: isReducedMotion ? 0.2 : 0.9,
        ease: [0.76, 0, 0.24, 1] as const,
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#141414] overflow-x-hidden">
      {/* 1. Loader */}
      <Loader />

      {/* 2. Menu Layer: fixed, full viewport, background #141414, sits BEHIND page wrapper (z-index 10) */}
      <PushDownMenu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        onNavigateSection={handleNavigateSection}
        onNavigateRoute={handleNavigateRoute}
        firstLinkRef={firstLinkRef}
        menuButtonRef={menuButtonRef}
      />

      {/* 3. Header: fixed above both layers (z-50) and never transformed */}
      <HeaderNav
        onToggleMenu={handleToggleMenu}
        isMenuOpen={isMenuOpen}
        menuButtonRef={menuButtonRef}
      />

      {/* 4. Page Wrapper: wraps the entire landing page in one transformed container (z-20) */}
      <motion.div
        variants={pageVariants}
        initial="closed"
        animate={isMenuOpen ? 'open' : 'closed'}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
        onClick={isMenuOpen ? handleCloseMenu : undefined}
        {...((isMenuOpen ? { inert: '' } : {}) as any)}
        aria-hidden={isMenuOpen}
        style={{
          transformOrigin: 'top center',
          willChange: isAnimating ? 'transform' : 'auto',
        }}
        className={`relative z-20 min-h-screen bg-[#ECEFEC] text-[#141414] font-sans selection:bg-[#FFB020] selection:text-[#141414] shadow-2xl transition-[filter] duration-700 ${
          isMenuOpen ? 'cursor-pointer overflow-hidden' : ''
        }`}
      >
        {/* Hero Section */}
        <Hero onOpenMenu={handleToggleMenu} />

        {/* Facts Block */}
        <FactsBlock />

        {/* Capabilities Intro + Card Grid */}
        <CapabilitiesSection />

        {/* Modules Dial */}
        <ModulesDial />

        {/* Security Section */}
        <SecuritySection />

        {/* How It Works */}
        <ArchitectureSection
          onGetStarted={() => {
            navigate('/signup');
          }}
        />

        {/* Principles */}
        <PrinciplesSection
          onGetStarted={() => {
            navigate('/signup');
          }}
        />

        {/* Stack / Teams Wheel */}
        <StackWheel />

        {/* Pre-Footer CTA */}
        <PreFooterCta
          onOpenSignup={() => {
            navigate('/signup');
          }}
        />

        {/* Footer */}
        <Footer
          onOpenSignup={() => {
            navigate('/signup');
          }}
        />
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.landing} element={<MarketingPage />} />
          <Route
            path={ROUTES.login}
            element={
              <GuestOnly>
                <LoginScreen />
              </GuestOnly>
            }
          />
          <Route
            path={ROUTES.signup}
            element={
              <GuestOnly>
                <SignupScreen />
              </GuestOnly>
            }
          />
          <Route
            element={
              <RequireAuth>
                <WorkspaceProvider>
                  <AppShell />
                </WorkspaceProvider>
              </RequireAuth>
            }
          >
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.products} element={<ProductsPage />} />
            <Route path={ROUTES.orders} element={<OrdersPage />} />
            <Route path={ROUTES['stock-adjustments']} element={<StockLogPage />} />
            <Route
              path={ROUTES.users}
              element={
                <RequireAdmin>
                  <UsersPage />
                </RequireAdmin>
              }
            />
            <Route path={ROUTES.reports} element={<ReportsPage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
