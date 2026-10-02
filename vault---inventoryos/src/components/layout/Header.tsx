import React, { useState, useRef, useEffect } from 'react';
import { Tenant, SystemNotification, CurrentUserProfile, NavigationPage } from '../../types';
import { VAULT_LOGO_URL } from '../../data/mockData';
import { getInitials } from '../../lib/initials';

interface HeaderProps {
  currentTenant: Tenant;
  currentUser: CurrentUserProfile | null;
  notifications: SystemNotification[];
  onClearNotification: (id: string) => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  onNavigate: (page: NavigationPage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTenant,
  currentUser,
  notifications,
  onClearNotification,
  onOpenMobileMenu,
  onLogout,
  onNavigate,
}) => {
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = currentUser?.displayName || 'User';
  const email = currentUser?.email || '';
  const role = currentUser?.role || 'Staff';
  const initials = getInitials(displayName || email);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#0E1424]/85 backdrop-blur-xl z-30 px-4 sm:px-6 flex items-center justify-between border-b border-white/5 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5"
          title="Open Navigation"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="flex items-center gap-2">
          <img
            src={VAULT_LOGO_URL}
            alt="VAULT"
            className="h-7 w-7 object-contain hidden sm:block"
          />
          <div className="bg-[#0E1424] border border-white/10 px-3.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[#5356ff] text-[18px]">domain</span>
            <span className="text-sm text-[#F1F5F9] font-medium tracking-tight">
              {currentTenant.name}
            </span>
            <span className="font-mono text-[10px] text-[#475569]">{currentTenant.code}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="relative p-2 rounded-xl text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5 transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#5356ff]" />
            )}
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0f131c] border border-white/10 shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 px-1">
                <span className="text-sm font-semibold text-[#F1F5F9]">Notifications</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#5356ff]/20 text-[#c0c1ff]">
                  {notifications.length}
                </span>
              </div>

              <div className="divide-y divide-white/5 max-h-80 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#94A3B8]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="py-2.5 px-2 hover:bg-white/5 rounded-lg transition-colors group flex items-start justify-between gap-2"
                    >
                      <div className="flex gap-2.5">
                        <span
                          className={`material-symbols-outlined text-[18px] mt-0.5 ${
                            notif.type === 'critical'
                              ? 'text-[#EF4444]'
                              : notif.type === 'warning'
                                ? 'text-[#F59E0B]'
                                : notif.type === 'success'
                                  ? 'text-[#10B981]'
                                  : 'text-[#06B6D4]'
                          }`}
                        >
                          {notif.type === 'critical'
                            ? 'warning'
                            : notif.type === 'success'
                              ? 'check_circle'
                              : 'info'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#F1F5F9]">{notif.title}</span>
                          <span className="text-[11px] text-[#94A3B8] leading-relaxed">
                            {notif.message}
                          </span>
                          <span className="text-[10px] font-mono text-[#475569] mt-0.5">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onClearNotification(notif.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#475569] hover:text-[#EF4444] transition-opacity p-1"
                        title="Dismiss"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 bg-[#0E1424] border border-white/5 hover:border-white/15 px-2 sm:px-3 py-1.5 rounded-full hover:bg-[#1c2029] transition-all cursor-pointer shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#5356ff]/25 text-[#c0c1ff] flex items-center justify-center text-xs font-semibold ring-1 ring-[#5356ff]/40">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left pr-1">
              <span className="text-xs font-semibold text-[#F1F5F9] leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] font-mono font-semibold text-[#5356ff] uppercase tracking-wider leading-tight">
                {role}
              </span>
            </div>
            <span className="material-symbols-outlined text-[#94A3B8] text-[16px]">
              unfold_more
            </span>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0f131c] border border-white/10 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="text-xs font-semibold text-white">{displayName}</p>
                <p className="text-[11px] text-[#94A3B8] truncate">{email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/20 text-[#10B981]">
                  {role}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 text-left"
                >
                  <span className="material-symbols-outlined text-[16px]">settings</span>
                  <span>Workspace Preferences</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('users');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 text-left"
                >
                  <span className="material-symbols-outlined text-[16px]">shield_person</span>
                  <span>Team Access</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#EF4444] hover:bg-[#EF4444]/10 text-left font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
