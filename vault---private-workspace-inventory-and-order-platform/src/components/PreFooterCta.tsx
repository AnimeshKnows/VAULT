import React, { useState } from 'react';
import { SectionTag } from './SectionTag';
import { VaultPillButton } from './VaultPillButton';
import { CheckCircle2, Lock, X } from 'lucide-react';
import { FadeRise } from './MotionWrappers';

interface PreFooterCtaProps {
  onOpenSignup?: () => void;
}

export const PreFooterCta: React.FC<PreFooterCtaProps> = ({ onOpenSignup }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('Apex Supplies');
  const [adminEmail, setAdminEmail] = useState('alex@apexsupplies.com');
  const [provisioned, setProvisioned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setProvisioned(true);
    }, 600);
  };

  const handleOpen = () => {
    if (onOpenSignup) onOpenSignup();
    setModalOpen(true);
  };

  return (
    <section
      id="signup"
      data-theme="dark"
      className="relative w-full py-28 sm:py-36 px-4 sm:px-8 lg:px-12 bg-[#141414] text-white overflow-hidden text-center"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FFB020]/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* S.08 NEXT PAGE tag */}
        <FadeRise>
          <SectionTag index="S.08" label="NEXT PAGE" theme="dark" />
        </FadeRise>

        <FadeRise delay={0.1}>
          <h2 className="font-sans font-black text-4xl sm:text-6xl md:text-7xl tracking-[-0.035em] text-white leading-tight max-w-3xl mt-2 mb-8">
            Ready to organize your stock and orders?
          </h2>
        </FadeRise>

        {/* Centered white pill "CREATE YOUR WORKSPACE" */}
        <FadeRise delay={0.2} className="my-2">
          <VaultPillButton
            label="CREATE YOUR WORKSPACE"
            variant="light"
            href="/signup"
          />
        </FadeRise>

        {/* Small mono line beneath: "FREE TO TRY" */}
        <FadeRise delay={0.3}>
          <p className="font-mono text-xs sm:text-[13px] text-neutral-400 uppercase tracking-widest mt-6">
            FREE TO TRY
          </p>
        </FadeRise>
      </div>

      {/* Interactive Workspace Provisioning Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 text-left"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-white space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#FFB020] uppercase tracking-widest">
                  GET STARTED
                </span>
                <h3 className="font-sans font-bold text-xl tracking-tight mt-0.5">
                  Create Your Company Workspace
                </h3>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setProvisioned(false);
                }}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!provisioned ? (
              <form onSubmit={handleCreate} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] mb-1.5">
                    COMPANY NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white font-sans text-sm focus:outline-none focus:border-[#FFB020]"
                    placeholder="e.g. Apex Supplies"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider text-[10px] mb-1.5">
                    WORK EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-white font-sans text-sm focus:outline-none focus:border-[#FFB020]"
                    placeholder="alex@company.com"
                  />
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Lock className="w-3 h-3 text-[#FFB020]" />
                    <span>PRIVATE WORKSPACE URL: <code>app.vault.com/{companyName.toLowerCase().replace(/\s+/g, '-')}</code></span>
                  </div>
                  <div>• Initial user receives full Administrator privileges.</div>
                  <div>• Invite staff and team members anytime from settings.</div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 rounded-full bg-white text-[#141414] font-mono text-xs uppercase font-bold tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'CREATING WORKSPACE...' : 'START FREE WORKSPACE'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    WORKSPACE CREATED
                  </div>
                  <p className="text-neutral-300 font-sans text-xs">
                    Your workspace <strong>{companyName}</strong> is ready. Add products, invite team members, and start taking orders.
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] text-neutral-400 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                  <div>COMPANY: {companyName}</div>
                  <div>ADMINISTRATOR: {adminEmail}</div>
                  <div>STATUS: ACTIVE &amp; READY</div>
                </div>

                <button
                  onClick={() => {
                    setModalOpen(false);
                    setProvisioned(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-white text-[#141414] font-mono text-xs uppercase font-bold tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  RETURN TO HOME
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
