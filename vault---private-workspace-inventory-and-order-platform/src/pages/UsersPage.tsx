import React, { useState } from 'react';
import { useWorkspace } from '../context/workspaceContext';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  SkeletonRows,
  StatusPill,
  Table,
} from '../components/ui';
import { friendlyApiMessage } from '../lib/errors';

export const UsersPage: React.FC = () => {
  const { users, currentUser, bootstrapping, inviteUser, updateUser, deactivateUser } =
    useWorkspace();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Staff'>('Staff');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitInvite = async () => {
    setSaving(true);
    setError(null);
    try {
      await inviteUser({ email, password, firstName, lastName, role });
      setInviteOpen(false);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('Staff');
    } catch (err) {
      setError(friendlyApiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-8 space-y-6">
      <PageHeader
        index="S.05"
        label="TEAM"
        title="Team"
        description="Admin and Staff access for this private workspace."
        actions={
          <Button type="button" size="sm" onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
        }
      />

      <Card>
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary mb-3">
          Role explainer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <Badge tone="amber">Admin</Badge>
            <p className="mt-2 text-vault-secondary">
              Everything including cancelling orders, deleting products, and managing users.
            </p>
          </div>
          <div>
            <Badge tone="neutral">Staff</Badge>
            <p className="mt-2 text-vault-secondary">
              Manage products, stock, and orders except cancelling and deleting.
            </p>
          </div>
        </div>
      </Card>

      {bootstrapping ? (
        <SkeletonRows rows={4} cols={4} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No team members loaded"
          description="Invite an Admin or Staff member to collaborate."
          actionLabel="Invite member"
          onAction={() => setInviteOpen(true)}
        />
      ) : (
        <Table
          rows={users}
          rowKey={(u) => u.id}
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (u) => <span className="text-sm text-vault-text">{u.name}</span>,
            },
            { key: 'email', header: 'Email', render: (u) => u.email },
            {
              key: 'role',
              header: 'Role',
              render: (u) => (
                <Badge tone={u.role === 'Admin' ? 'amber' : 'neutral'}>{u.role}</Badge>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (u) => (
                <StatusPill
                  label={u.activeStatus}
                  tone={u.activeStatus === 'Active' ? 'success' : 'neutral'}
                  icon={u.activeStatus === 'Active' ? 'check_circle' : 'pause_circle'}
                />
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <div className="flex flex-wrap gap-1">
                    <Select
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => {
                        if (isSelf) return;
                        void updateUser(u.id, {
                          firstName: u.firstName,
                          lastName: u.lastName,
                          role: e.target.value as 'Admin' | 'Staff',
                          isActive: u.activeStatus === 'Active',
                        }).catch(() => undefined);
                      }}
                      options={[
                        { value: 'Admin', label: 'Admin' },
                        { value: 'Staff', label: 'Staff' },
                      ]}
                      className="!h-8 min-w-[100px]"
                      aria-label={`Role for ${u.name}`}
                    />
                    {u.activeStatus === 'Active' && !isSelf ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        withArrow={false}
                        onClick={() => void deactivateUser(u.id)}
                      >
                        Deactivate
                      </Button>
                    ) : null}
                    {u.activeStatus === 'Inactive' && !isSelf ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        withArrow={false}
                        onClick={() =>
                          void updateUser(u.id, {
                            firstName: u.firstName,
                            lastName: u.lastName,
                            role: u.role,
                            isActive: true,
                          })
                        }
                      >
                        Activate
                      </Button>
                    ) : null}
                    {isSelf ? (
                      <span className="text-[10px] font-mono text-vault-muted self-center">You</span>
                    ) : null}
                  </div>
                );
              },
            },
          ]}
        />
      )}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite member"
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" withArrow={false} onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" loading={saving} onClick={() => void submitInvite()}>
              Invite
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Temporary password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'Admin' | 'Staff')}
            options={[
              { value: 'Staff', label: 'Staff' },
              { value: 'Admin', label: 'Admin' },
            ]}
          />
          {error ? (
            <p className="text-xs text-vault-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};
