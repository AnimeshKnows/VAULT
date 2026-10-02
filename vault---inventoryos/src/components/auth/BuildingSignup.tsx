import React, { useState } from 'react';
import { NavigationPage } from '../../types';
import { registerTenant } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { getTenantId } from '../../lib/auth/session';

interface BuildingSignupProps {
  onSuccess: (tenantId: string) => void;
  onNavigate: (page: NavigationPage) => void;
  onStateChange?: (state: 'default' | 'building' | 'unlocked') => void;
}

interface ApartmentUnit {
  id: string;
  floor: number;
  number: number;
  label: string;
  status: 'occupied' | 'vacant' | 'target' | 'assigned';
  tenant?: string;
  lightHue: 'amber' | 'cyan' | 'violet';
  silhouetteType: 'servers' | 'workstation' | 'person' | 'rack';
}

export const BuildingSignup: React.FC<BuildingSignupProps> = ({
  onSuccess,
  onNavigate,
  onStateChange,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [targetUnitId, setTargetUnitId] = useState<string>('u-304');
  const [formGlassMode, setFormGlassMode] = useState<'frosted' | 'ultra-clear'>('frosted');
  const [isManualFormHidden, setIsManualFormHidden] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredTenantId, setRegisteredTenantId] = useState<string | null>(null);

  // Registration stage: 'idle' | 'scanning' | 'assigning' | 'completed'
  const [stage, setStage] = useState<'idle' | 'scanning' | 'assigning' | 'completed'>('idle');

  // When stage is not idle (i.e. user submitted "Register & Assign Apartment Unit")
  // or user manually toggled hide form, the form vanishes completely!
  const isFormVanished = stage !== 'idle' || isManualFormHidden;

  // Initial 5 floors × 6 units = 30 apartments behind the form
  const [apartments, setApartments] = useState<ApartmentUnit[]>([
    // Level 05 - Penthouse & Cloud Node Level
    { id: 'u-501', floor: 5, number: 1, label: 'P-501', status: 'occupied', tenant: 'Apex Robotics', lightHue: 'cyan', silhouetteType: 'servers' },
    { id: 'u-502', floor: 5, number: 2, label: 'P-502', status: 'vacant', lightHue: 'cyan', silhouetteType: 'servers' },
    { id: 'u-503', floor: 5, number: 3, label: 'P-503', status: 'occupied', tenant: 'CyberTech EU', lightHue: 'violet', silhouetteType: 'workstation' },
    { id: 'u-504', floor: 5, number: 4, label: 'P-504', status: 'occupied', tenant: 'Orbital Mesh', lightHue: 'cyan', silhouetteType: 'person' },
    { id: 'u-505', floor: 5, number: 5, label: 'P-505', status: 'vacant', lightHue: 'amber', silhouetteType: 'rack' },
    { id: 'u-506', floor: 5, number: 6, label: 'P-506', status: 'occupied', tenant: 'Hyperion Labs', lightHue: 'violet', silhouetteType: 'servers' },

    // Level 04 - High-Altitude Logistics Suite
    { id: 'u-401', floor: 4, number: 1, label: 'U-401', status: 'occupied', tenant: 'Solarix Supply', lightHue: 'amber', silhouetteType: 'workstation' },
    { id: 'u-402', floor: 4, number: 2, label: 'U-402', status: 'vacant', lightHue: 'cyan', silhouetteType: 'servers' },
    { id: 'u-403', floor: 4, number: 3, label: 'U-403', status: 'occupied', tenant: 'AeroFreight Int.', lightHue: 'cyan', silhouetteType: 'servers' },
    { id: 'u-404', floor: 4, number: 4, label: 'U-404', status: 'occupied', tenant: 'Quantum Sync', lightHue: 'violet', silhouetteType: 'workstation' },
    { id: 'u-405', floor: 4, number: 5, label: 'U-405', status: 'vacant', lightHue: 'amber', silhouetteType: 'person' },
    { id: 'u-406', floor: 4, number: 6, label: 'U-406', status: 'occupied', tenant: 'Krono Express', lightHue: 'amber', silhouetteType: 'rack' },

    // Level 03 - Core Enterprise Data Floor (Target Apartment sits here)
    { id: 'u-301', floor: 3, number: 1, label: 'U-301', status: 'occupied', tenant: 'Vortex Cloud', lightHue: 'cyan', silhouetteType: 'servers' },
    { id: 'u-302', floor: 3, number: 2, label: 'U-302', status: 'vacant', lightHue: 'cyan', silhouetteType: 'servers' },
    { id: 'u-303', floor: 3, number: 3, label: 'U-303', status: 'occupied', tenant: 'Acme Global Store', lightHue: 'amber', silhouetteType: 'workstation' },
    { id: 'u-304', floor: 3, number: 4, label: 'U-304', status: 'vacant', lightHue: 'amber', silhouetteType: 'rack' }, // Default assignment target
    { id: 'u-305', floor: 3, number: 5, label: 'U-305', status: 'occupied', tenant: 'Titan Heavy Ltd', lightHue: 'violet', silhouetteType: 'servers' },
    { id: 'u-306', floor: 3, number: 6, label: 'U-306', status: 'vacant', lightHue: 'amber', silhouetteType: 'person' },

    // Level 02 - Mid-Tier Operations Floor
    { id: 'u-201', floor: 2, number: 1, label: 'U-201', status: 'vacant', lightHue: 'amber', silhouetteType: 'servers' },
    { id: 'u-202', floor: 2, number: 2, label: 'U-202', status: 'occupied', tenant: 'OmniWare Labs', lightHue: 'cyan', silhouetteType: 'rack' },
    { id: 'u-203', floor: 2, number: 3, label: 'U-203', status: 'vacant', lightHue: 'violet', silhouetteType: 'servers' },
    { id: 'u-204', floor: 2, number: 4, label: 'U-204', status: 'occupied', tenant: 'Vector Logistics', lightHue: 'amber', silhouetteType: 'workstation' },
    { id: 'u-205', floor: 2, number: 5, label: 'U-205', status: 'occupied', tenant: 'Synthetix Corp', lightHue: 'cyan', silhouetteType: 'person' },
    { id: 'u-206', floor: 2, number: 6, label: 'U-206', status: 'vacant', lightHue: 'cyan', silhouetteType: 'servers' },

    // Level 01 - Bulkhead Dispatch & Ground Hub
    { id: 'u-101', floor: 1, number: 1, label: 'G-101', status: 'occupied', tenant: 'Ground Dock 1A', lightHue: 'amber', silhouetteType: 'rack' },
    { id: 'u-102', floor: 1, number: 2, label: 'G-102', status: 'occupied', tenant: 'Security Center', lightHue: 'cyan', silhouetteType: 'person' },
    { id: 'u-103', floor: 1, number: 3, label: 'G-103', status: 'vacant', lightHue: 'violet', silhouetteType: 'servers' },
    { id: 'u-104', floor: 1, number: 4, label: 'G-104', status: 'occupied', tenant: 'Central Dispatch Hub', lightHue: 'amber', silhouetteType: 'servers' },
    { id: 'u-105', floor: 1, number: 5, label: 'G-105', status: 'vacant', lightHue: 'cyan', silhouetteType: 'workstation' },
    { id: 'u-106', floor: 1, number: 6, label: 'G-106', status: 'occupied', tenant: 'Fiber Gateway 01', lightHue: 'amber', silhouetteType: 'rack' },
  ]);

  const vacantUnits = apartments.filter((u) => u.status === 'vacant' || u.status === 'target');
  const assignedUnit = apartments.find((u) => u.id === targetUnitId) || apartments[0];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage !== 'idle') return;

    setErrorMessage('');
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters (API validation).');
      return;
    }

    const nameParts = adminName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Admin';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    if (onStateChange) onStateChange('building');
    setStage('scanning');

    try {
      const auth = await registerTenant({
        tenantName: companyName.trim(),
        email: adminEmail.trim(),
        password,
        firstName,
        lastName,
      });
      setRegisteredTenantId(auth.tenantId);

      setStage('assigning');
      setApartments((prev) =>
        prev.map((u) => (u.id === targetUnitId ? { ...u, status: 'target' } : u))
      );

      setTimeout(() => {
        setApartments((prev) =>
          prev.map((u) =>
            u.id === targetUnitId
              ? {
                  ...u,
                  status: 'assigned',
                  tenant: companyName || 'New Tenant',
                  lightHue: 'amber',
                }
              : u
          )
        );
        setStage('completed');

        setTimeout(() => {
          onSuccess(auth.tenantId);
        }, 3400);
      }, 1600);
    } catch (err) {
      setStage('idle');
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : 'Unable to reach VAULT API. Is the backend running?'
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. ARCHITECTURAL BUILDING (BECOMES 100% CLEARLY VISIBLE AS FORM VANISHES) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center pointer-events-auto overflow-hidden z-0">
        {/* Sky Ambient / Atmospheric Depth Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#04060a] via-[#070b14] to-[#0a0f1d] pointer-events-none" />

        {/* Ambient Building Spotlights & Glow Spheres */}
        <div className="absolute top-1/6 left-1/4 w-[550px] h-[380px] bg-[#5356ff]/12 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[480px] h-[420px] bg-[#F59E0B]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[600px] bg-[#82cfff]/8 rounded-full blur-[140px] pointer-events-none" />

        {/* Dynamic Scanning Grid Beam when scanning the building */}
        {stage === 'scanning' && (
          <div className="absolute inset-x-0 h-2 bg-gradient-to-r from-transparent via-[#82cfff] to-transparent shadow-[0_0_35px_#82cfff] z-20 animate-[bounce_1.8s_infinite] pointer-events-none" />
        )}

        {/* THE BUILDING FACADE */}
        <div
          className={`relative w-full max-w-5xl px-3 sm:px-6 flex flex-col items-center justify-center transition-all duration-1000 ease-out ${
            isFormVanished
              ? 'scale-[1.04] brightness-115 drop-shadow-[0_0_60px_rgba(83,86,255,0.2)]'
              : 'scale-100'
          }`}
        >
          {/* Building Rooftop / Crown Architecture */}
          <div className="w-full flex items-end justify-between px-6 pb-2 border-b border-white/10 relative">
            {/* Left Antenna Mast */}
            <div className="flex items-end gap-3">
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
                <div className="w-0.5 h-10 bg-gradient-to-t from-white/30 to-[#EF4444]" />
                <div className="w-3 h-1 bg-white/20" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold tracking-widest text-[#82cfff] uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  VAULT TOWER // FACILITY 07
                </span>
                <span className="font-mono text-[9px] text-[#64748B] block">
                  LAT 37.7749° N • LON 122.4194° W • HIGH-AVAILABILITY CLUSTER
                </span>
              </div>
            </div>

            {/* Live Building Status Indicator */}
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-[#F59E0B]">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span>OCCUPIED ({apartments.filter((a) => a.status === 'occupied' || a.status === 'assigned').length})</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#82cfff]">
                <span className="w-2 h-2 rounded-full border border-[#82cfff] shadow-[0_0_6px_rgba(130,207,255,0.4)]" />
                <span>VACANT ({apartments.filter((a) => a.status === 'vacant' || a.status === 'target').length})</span>
              </div>
            </div>

            {/* Right Antenna Mast */}
            <div className="flex items-end gap-2">
              <div className="w-0.5 h-7 bg-white/20" />
              <div className="w-0.5 h-12 bg-gradient-to-t from-white/30 to-[#10B981]" />
            </div>
          </div>

          {/* BUILDING APARTMENTS MATRIX: 5 Floors with Architectural Columns & Lit Windows */}
          <div className="w-full bg-[#070b14]/85 border-x border-b border-white/10 p-3 sm:p-5 rounded-b-2xl shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
            <div className="space-y-3 sm:space-y-3.5">
              {[5, 4, 3, 2, 1].map((floorNum) => {
                const floorUnits = apartments.filter((u) => u.floor === floorNum);
                const floorLabel =
                  floorNum === 5
                    ? 'L05 // PENTHOUSE NODE'
                    : floorNum === 4
                    ? 'L04 // HIGH-ALTITUDE SUITES'
                    : floorNum === 3
                    ? 'L03 // ENTERPRISE DATA LOFT'
                    : floorNum === 2
                    ? 'L02 // LOGISTICS SUITES'
                    : 'L01 // BULKHEAD HUB';

                return (
                  <div key={floorNum} className="relative group/floor">
                    {/* Floor Structural Beam & Conduit */}
                    <div className="flex items-center justify-between px-2 mb-1 text-[9px] font-mono text-[#475569]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1 h-2 bg-[#82cfff]/40 rounded-xs" />
                        {floorLabel}
                      </span>
                      <span className="hidden sm:inline text-white/20">BUS #{floorNum * 120} • 100GbE MESH</span>
                    </div>

                    {/* Apartment Units Row */}
                    <div className="grid grid-cols-6 gap-2 sm:gap-3">
                      {floorUnits.map((unit) => {
                        const isThisTarget = unit.id === targetUnitId;
                        const isAssigned = unit.status === 'assigned';
                        const isOccupied = unit.status === 'occupied' || isAssigned;
                        const isTargeting = unit.status === 'target' || (isThisTarget && stage === 'assigning');

                        return (
                          <div
                            key={unit.id}
                            onClick={() => {
                              if (unit.status === 'vacant' && stage === 'idle') {
                                setTargetUnitId(unit.id);
                              }
                            }}
                            title={
                              isAssigned
                                ? `★ Assigned to: ${companyName}`
                                : isOccupied
                                ? `Occupied by: ${unit.tenant}`
                                : `Vacant: Click to select ${unit.label}`
                            }
                            className={`relative h-20 sm:h-24 rounded-xl border transition-all duration-700 p-1.5 flex flex-col justify-between overflow-visible cursor-pointer ${
                              isAssigned
                                ? 'bg-gradient-to-b from-[#F59E0B]/45 to-[#F59E0B]/15 border-[#F59E0B] shadow-[0_0_40px_rgba(245,158,11,0.9)] scale-[1.06] z-30 ring-2 ring-[#F59E0B]'
                                : isTargeting
                                ? 'border-[#82cfff] bg-[#82cfff]/25 shadow-[0_0_35px_rgba(130,207,255,0.7)] animate-pulse scale-[1.03] z-20 ring-2 ring-[#82cfff]/60'
                                : isThisTarget && stage === 'idle'
                                ? 'border-[#82cfff]/70 bg-[#82cfff]/15 shadow-[0_0_20px_rgba(130,207,255,0.3)] ring-1 ring-[#82cfff]/50'
                                : isOccupied
                                ? 'bg-[#0b101c]/90 border-white/10 hover:border-white/25'
                                : 'bg-[#080d18]/60 border-dashed border-white/10 hover:border-[#82cfff]/50 hover:bg-[#82cfff]/10'
                            }`}
                          >
                            {/* Floating Callout Badge above Newly Assigned Apartment */}
                            {isAssigned && stage === 'completed' && (
                              <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap px-3 py-1 rounded-lg bg-[#F59E0B] text-black font-mono font-bold text-[10px] shadow-[0_0_25px_rgba(245,158,11,1)] flex items-center gap-1.5 animate-bounce pointer-events-none">
                                <span className="material-symbols-outlined text-[13px]">key</span>
                                <span>{companyName || 'TENANT'} • {unit.label} ASSIGNED</span>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F59E0B] rotate-45" />
                              </div>
                            )}

                            {/* Targeting Laser Ring during assignment */}
                            {isTargeting && (
                              <div className="absolute -inset-1 border-2 border-[#82cfff] rounded-xl pointer-events-none animate-ping opacity-75" />
                            )}

                            {/* Window Unit Header */}
                            <div className="flex items-center justify-between z-10">
                              <span
                                className={`font-mono text-[8px] sm:text-[9px] font-bold ${
                                  isAssigned
                                    ? 'text-[#F59E0B]'
                                    : isTargeting
                                    ? 'text-[#82cfff]'
                                    : isOccupied
                                    ? 'text-white/90'
                                    : 'text-[#64748B]'
                                }`}
                              >
                                {unit.label}
                              </span>

                              {/* Glowing Status LED / Activity Light */}
                              <span
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                                  isAssigned
                                    ? 'bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,1)] animate-ping'
                                    : isTargeting
                                    ? 'bg-[#82cfff] shadow-[0_0_8px_rgba(130,207,255,1)] animate-bounce'
                                    : isOccupied
                                    ? unit.lightHue === 'cyan'
                                      ? 'bg-[#82cfff] shadow-[0_0_4px_rgba(130,207,255,0.8)]'
                                      : unit.lightHue === 'violet'
                                      ? 'bg-[#c0c1ff] shadow-[0_0_4px_rgba(192,193,255,0.8)]'
                                      : 'bg-[#F59E0B] shadow-[0_0_4px_rgba(245,158,11,0.8)]'
                                    : 'bg-[#475569]/30'
                                }`}
                              />
                            </div>

                            {/* Interior Apartment Activity Illustration (Windows & Silhouettes) */}
                            <div className="relative flex-1 my-1 rounded-md overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center">
                              {isOccupied ? (
                                <div className="w-full h-full relative p-1 flex flex-col justify-end">
                                  {/* Warm Interior Room Illumination */}
                                  <div
                                    className={`absolute inset-0 transition-opacity duration-700 ${
                                      isAssigned
                                        ? 'bg-gradient-to-t from-[#F59E0B]/90 via-[#F59E0B]/50 to-transparent opacity-100'
                                        : unit.lightHue === 'cyan'
                                        ? 'bg-gradient-to-t from-[#82cfff]/45 via-[#82cfff]/15 to-transparent opacity-60'
                                        : unit.lightHue === 'violet'
                                        ? 'bg-gradient-to-t from-[#c0c1ff]/45 via-[#c0c1ff]/15 to-transparent opacity-60'
                                        : 'bg-gradient-to-t from-[#F59E0B]/50 via-[#F59E0B]/20 to-transparent opacity-70'
                                    }`}
                                  />

                                  {/* Interior Window Blinds / Architectural Mullions */}
                                  <div className="absolute inset-0 grid grid-cols-2 pointer-events-none opacity-20">
                                    <div className="border-r border-white" />
                                    <div />
                                  </div>

                                  {/* Silhouettes / Equipment within the apartment */}
                                  <div className="relative z-10 flex items-end justify-between px-1">
                                    {unit.silhouetteType === 'servers' ? (
                                      <>
                                        <div className="w-1.5 h-4 sm:h-5 bg-white/50 rounded-t-xs" />
                                        <div className="w-2 h-6 sm:h-7 bg-white/80 rounded-t-xs" />
                                        <div className="w-1.5 h-3 sm:h-4 bg-white/40 rounded-t-xs" />
                                      </>
                                    ) : unit.silhouetteType === 'workstation' ? (
                                      <>
                                        <div className="w-3 h-3 sm:h-4 bg-white/50 rounded-xs" />
                                        <div className="w-1.5 h-6 bg-white/70 rounded-t-xs" />
                                      </>
                                    ) : unit.silhouetteType === 'person' ? (
                                      <>
                                        <div className="w-1 h-3 bg-white/30 rounded-t-xs" />
                                        <div className="w-2.5 h-5 bg-white/70 rounded-t-sm" />
                                        <div className="w-1 h-2 bg-white/40" />
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-2 h-6 sm:h-7 bg-white/60 rounded-t-xs" />
                                        <div className="w-2 h-4 sm:h-5 bg-white/50 rounded-t-xs" />
                                      </>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <span className="material-symbols-outlined text-[#475569] text-[13px] sm:text-[15px] group-hover:text-[#82cfff] transition-colors">
                                    meeting_room
                                  </span>
                                  <span className="block font-mono text-[7px] text-[#475569] uppercase">
                                    VACANT
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Tenant Ribbon / Sub-label */}
                            <div className="pt-0.5 truncate text-center">
                              {isAssigned ? (
                                <span className="font-mono text-[8px] sm:text-[9px] text-[#F59E0B] font-bold truncate block animate-pulse">
                                  ★ {companyName || 'Assigned'}
                                </span>
                              ) : isThisTarget ? (
                                <span className="font-mono text-[7px] sm:text-[8px] text-[#82cfff] font-bold uppercase truncate block">
                                  &gt; Target Slot
                                </span>
                              ) : isOccupied ? (
                                <span className="text-[7px] sm:text-[8px] text-[#94A3B8] truncate block">
                                  {unit.tenant}
                                </span>
                              ) : (
                                <span className="text-[7px] font-mono text-[#475569] block">
                                  Select Slot
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Building Ground Foundation: Power Conduit & Fiber Hub */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-[#10B981]">domain_verification</span>
                <span>SUB-TERRAIN FIBER BACKBONE // ACTIVE BUS</span>
              </div>
              <span className="text-[#82cfff]">40 GBIT/S LOW LATENCY</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CINEMATIC ASSIGNMENT TELEMETRY OVERLAY (WHEN FORM VANISHES)           */}
      {/* ========================================================================= */}
      {stage !== 'idle' && (
        <div className="fixed top-8 inset-x-0 mx-auto w-fit z-50 px-6 py-3 rounded-2xl bg-black/85 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
          {stage === 'scanning' ? (
            <>
              <div className="w-3 h-3 rounded-full bg-[#82cfff] animate-ping" />
              <div>
                <span className="font-mono text-xs font-bold text-white tracking-wider block">
                  GRID SCAN ACTIVE // EXAMINING FACILITY 07
                </span>
                <span className="font-mono text-[10px] text-[#82cfff]">
                  Locating optimal unit for {companyName}...
                </span>
              </div>
            </>
          ) : stage === 'assigning' ? (
            <>
              <span className="material-symbols-outlined text-[20px] text-[#F59E0B] animate-spin">
                sync
              </span>
              <div>
                <span className="font-mono text-xs font-bold text-[#F59E0B] tracking-wider block">
                  LOCKING UNIT {assignedUnit.label} // SYNCING TENANT MESH
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  Subdomain: {workspaceSlug}.vault-os.net
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-3.5 h-3.5 rounded-full bg-[#10B981] shadow-[0_0_12px_#10B981]" />
              <div>
                <span className="font-mono text-xs font-bold text-white tracking-wider block">
                  UNIT {assignedUnit.label} ACTIVATED & ASSIGNED TO {companyName.toUpperCase()}
                </span>
                <span className="font-mono text-[10px] text-[#10B981]">
                  Tenant Provisioned • Redirecting to Console...
                </span>
              </div>
              <button
                onClick={() => onSuccess(registeredTenantId || getTenantId() || '')}
                className="ml-3 px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black font-mono font-bold text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.7)] cursor-pointer transition-all active:scale-95"
              >
                <span>Enter Now</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TOP FLOATING NAVIGATION & BACK BUTTON                                  */}
      {/* ========================================================================= */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-3">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-xs font-mono text-[#94A3B8] hover:text-white border border-white/15 backdrop-blur-xl transition-all shadow-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Landing</span>
        </button>

        {/* View Building / Toggle Form Visibility */}
        <button
          type="button"
          onClick={() => setIsManualFormHidden(!isManualFormHidden)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border backdrop-blur-xl transition-all shadow-lg cursor-pointer ${
            isManualFormHidden
              ? 'bg-[#82cfff]/20 text-[#82cfff] border-[#82cfff]/50'
              : 'bg-black/40 hover:bg-black/70 text-[#94A3B8] hover:text-white border-white/15'
          }`}
          title={isManualFormHidden ? 'Show form console' : 'Hide form to clearly view the full building'}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isManualFormHidden ? 'visibility' : 'visibility_off'}
          </span>
          <span>{isManualFormHidden ? 'Show Form' : 'View Full Building'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. FOREGROUND TRANSPARENT REGISTRATION FORM                               */}
      {/* (VANISHES COMPLETELY UPON CLICKING "REGISTER & ASSIGN APARTMENT UNIT")     */}
      {/* ========================================================================= */}
      <div
        className={`relative z-30 w-full max-w-lg mx-auto my-auto transition-all duration-700 ease-out ${
          isFormVanished
            ? 'opacity-0 scale-90 translate-y-12 pointer-events-none'
            : 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
        }`}
      >
        <div
          className={`rounded-3xl border transition-all duration-500 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.25)] ${
            formGlassMode === 'ultra-clear'
              ? 'bg-black/20 backdrop-blur-md border-white/20'
              : 'bg-black/40 backdrop-blur-xl border-white/25'
          }`}
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#82cfff] text-[20px]">apartment</span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#82cfff]">
                TENANT PROVISIONING
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#10B981] px-2.5 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                {vacantUnits.length} UNITS VACANT
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-between">
              <span>Claim Workspace Unit</span>
              {stage === 'completed' && (
                <span className="text-xs font-mono text-[#F59E0B] px-2 py-0.5 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/40">
                  ASSIGNED ✓
                </span>
              )}
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Register your organization to be allocated a dedicated live apartment unit inside the VAULT building behind this console.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-start gap-2.5 text-xs text-[#EF4444] font-mono">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {registeredTenantId && stage === 'completed' && (
            <div className="mb-4 p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 text-[11px] font-mono text-[#10B981]">
              Tenant provisioned: <span className="text-white">{registeredTenantId}</span>
            </div>
          )}

          {/* FORM INPUTS */}
          <form onSubmit={(e) => void handleRegister(e)} className="space-y-4 text-xs">
            {/* Business / Entity Name */}
            <div>
              <label className="block text-[#c0c1ff] mb-1 font-medium flex items-center justify-between">
                <span>Business / Entity Name</span>
                <span className="text-[10px] font-mono text-[#82cfff]">Auto-signs assigned unit</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                }}
                placeholder="e.g. Nexus Dynamics"
                required
                disabled={stage !== 'idle'}
                className="w-full h-10 px-3 rounded-xl bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-white/20 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#82cfff] focus:border-[#82cfff] transition-all disabled:opacity-50 placeholder-white/30 backdrop-blur-sm"
              />
            </div>

            {/* Workspace Subdomain */}
            <div>
              <label className="block text-[#c0c1ff] mb-1 font-medium">Tenant Workspace Subdomain</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={workspaceSlug}
                  onChange={(e) => setWorkspaceSlug(e.target.value)}
                  required
                  disabled={stage !== 'idle'}
                  className="flex-1 h-10 px-3 rounded-l-xl bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-r-0 border-white/20 text-[#82cfff] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#82cfff] focus:border-[#82cfff] transition-all disabled:opacity-50 placeholder-white/30 backdrop-blur-sm"
                />
                <span className="h-10 px-3 flex items-center bg-black/50 border border-white/20 rounded-r-xl font-mono text-[11px] text-[#94A3B8] backdrop-blur-sm">
                  .vault-os.net
                </span>
              </div>
            </div>

            {/* Two-Column: Contact & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#c0c1ff] mb-1 font-medium">Primary Contact</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  disabled={stage !== 'idle'}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-white/20 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#82cfff] focus:border-[#82cfff] transition-all disabled:opacity-50 placeholder-white/30 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-[#c0c1ff] mb-1 font-medium">Corporate Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  disabled={stage !== 'idle'}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-white/20 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#82cfff] focus:border-[#82cfff] transition-all disabled:opacity-50 placeholder-white/30 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#c0c1ff] mb-1 font-medium">Admin Password (min 8)</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={stage !== 'idle'}
                  className="w-full h-10 px-3 pr-10 rounded-xl bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-white/20 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#82cfff] focus:border-[#82cfff] transition-all disabled:opacity-50 placeholder-white/30 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#94A3B8] hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* DESIGNATED APARTMENT SLOT INDICATOR & QUICK SELECTOR */}
            <div className="p-3 rounded-2xl bg-black/35 border border-white/15 backdrop-blur-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">
                    {stage === 'completed' ? 'verified' : 'roofing'}
                  </span>
                  <div>
                    <span className="text-white font-medium block">
                      Target Apartment: <strong className="text-[#82cfff] font-mono">{assignedUnit.label}</strong>
                    </span>
                    <span className="text-[#94A3B8] text-[10px] font-mono">
                      Floor 0{assignedUnit.floor} • High-Bandwidth Dedicated Unit
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                    stage === 'completed'
                      ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50'
                      : stage === 'assigning'
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50 animate-pulse'
                      : 'bg-[#82cfff]/15 text-[#82cfff] border-[#82cfff]/30'
                  }`}
                >
                  {stage === 'completed'
                    ? 'LEASED'
                    : stage === 'assigning'
                    ? 'ALLOCATING'
                    : 'READY'}
                </span>
              </div>

              {/* Selector for other vacant apartments in building */}
              {stage === 'idle' && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-[#94A3B8]">Select different vacant unit:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-[240px] pb-0.5">
                    {vacantUnits.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setTargetUnitId(u.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                          u.id === targetUnitId
                            ? 'bg-[#82cfff] text-black font-bold shadow-[0_0_8px_rgba(130,207,255,0.7)]'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={stage !== 'idle'}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5356ff] to-[#4142ee] hover:from-[#6467ff] hover:to-[#5152fa] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(83,86,255,0.45)] hover:shadow-[0_0_35px_rgba(83,86,255,0.65)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 border border-white/20"
            >
              <span>Register & Assign Apartment Unit</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Switch to Login Link */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-[#94A3B8]">
              Already have an assigned unit?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[#82cfff] hover:text-white font-medium underline underline-offset-4 decoration-[#82cfff]/40 transition-colors cursor-pointer"
              >
                Enter through Locked Shutter →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
