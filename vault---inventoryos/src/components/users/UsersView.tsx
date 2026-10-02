import React, { useState } from 'react';
import { UserAccount } from '../../types';

interface UsersViewProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, onAddUser }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserAccount['role']>('Dispatch Clerk');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      activeStatus: 'Active',
      lastActive: 'Just now',
    };

    onAddUser(newUser);
    setName('');
    setEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="relative w-full pb-16">
      {/* Header */}
      <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
            <span>OPERATIONS</span>
            <span>/</span>
            <span className="text-[#82cfff]">ACCESS CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Team & RBAC Security
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Role-based access permissions, active sessions & multi-tenant security
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold shadow-[0_0_20px_rgba(83,86,255,0.45)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Invite Member</span>
        </button>
      </div>

      {/* Users Grid / Table */}
      <div className="rounded-xl bg-[#101525]/80 backdrop-blur-xl border border-white/5 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase tracking-wider border-b border-white/5">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Corporate Email</th>
                <th className="py-3 px-4">Role & Scope</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#181b25]/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                      />
                      <span className="font-semibold text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#94A3B8]">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                        u.role === 'Admin'
                          ? 'bg-[#5356ff]/20 text-[#c0c1ff]'
                          : u.role === 'Warehouse Manager'
                          ? 'bg-[#00a3e0]/20 text-[#82cfff]'
                          : u.role === 'Auditor'
                          ? 'bg-[#7e4ee8]/20 text-[#d0bcff]'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          u.activeStatus === 'Active' ? 'bg-[#10B981]' : 'bg-[#475569]'
                        }`}
                      />
                      <span className="text-[#dfe2ef]">{u.activeStatus}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#94A3B8]">{u.lastActive}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white font-mono text-[11px] transition-colors">
                      Edit Permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f131c] border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-base font-semibold text-white">Invite Team Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Deshmukh"
                  required
                  className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@company.com"
                  required
                  className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">RBAC Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                >
                  <option value="Admin">Admin (Full Cluster Control)</option>
                  <option value="Warehouse Manager">Warehouse Manager (Stock & Audits)</option>
                  <option value="Dispatch Clerk">Dispatch Clerk (Orders & Packing)</option>
                  <option value="Auditor">Auditor (Read-Only Ledger Proofs)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white font-medium"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
