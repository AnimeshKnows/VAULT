import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { getInitials } from '../../lib/initials';
import { ApiError } from '../../lib/api/client';

interface UsersViewProps {
  users: UserAccount[];
  onInviteUser: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'Admin' | 'Staff';
  }) => Promise<void>;
  onDeactivateUser: (id: string) => Promise<void>;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onInviteUser,
  onDeactivateUser,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Staff'>('Staff');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await onInviteUser({ email, password, firstName, lastName, role });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('Staff');
      setShowAddModal(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Invite failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full pb-16">
      <div className="pt-4 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Team
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Manage Admin and Staff access for this workspace
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Invite Member
        </button>
      </div>

      <div className="rounded-xl bg-[#101525]/80 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#181b25] text-[#475569] font-mono text-[10px] uppercase border-b border-white/5">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                    No team members loaded. Admin access is required.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#181b25]/80">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#5356ff]/25 text-[#c0c1ff] flex items-center justify-center text-[11px] font-semibold">
                          {getInitials(u.name || u.email)}
                        </div>
                        <span className="font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#94A3B8]">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                          u.role === 'Admin'
                            ? 'bg-[#5356ff]/20 text-[#c0c1ff]'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5">
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
                      {u.activeStatus === 'Active' && (
                        <button
                          onClick={() => void onDeactivateUser(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#EF4444]/15 text-[#94A3B8] hover:text-[#EF4444] font-mono text-[11px]"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-xs">
              {formError && (
                <div className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-[#EF4444]">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Temporary Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Admin' | 'Staff')}
                  className="w-full h-9 px-3 rounded-lg bg-[#181b25] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#5356ff]"
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#5356ff] hover:bg-[#4142ee] text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
