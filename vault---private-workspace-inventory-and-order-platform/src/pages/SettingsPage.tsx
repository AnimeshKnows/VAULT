import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/workspaceContext';
import { Badge, Button, Card, Input, PageHeader } from '../components/ui';
import { apiLogout, clearAuthSession } from '../utils/auth';
import { ROUTES } from '../lib/routes';
import { friendlyApiMessage } from '../lib/errors';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant, currentUser, updateTenantName, resetLocalState } = useWorkspace();
  const isAdmin = currentUser?.role === 'Admin';
  const [name, setName] = useState(tenant?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setName(tenant?.name ?? '');
  }, [tenant?.name]);

  const saveName = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setError(null);
    try {
      await updateTenantName(name.trim());
    } catch (err) {
      setError(friendlyApiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const copyId = async () => {
    if (!tenant?.id) return;
    try {
      await navigator.clipboard.writeText(tenant.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy Workspace ID');
    }
  };

  const logout = async () => {
    await apiLogout();
    clearAuthSession();
    resetLocalState();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="pb-8 space-y-6 max-w-2xl">
      <PageHeader
        index="S.07"
        label="WORKSPACE"
        title="Workspace"
        description="Workspace identity, profile, and session."
      />

      <Card className="space-y-4">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary">
          Workspace
        </h2>
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1">
              <Input label="Workspace name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="button" size="sm" loading={saving} onClick={() => void saveName()}>
              Save
            </Button>
          </div>
        ) : (
          <div>
            <p className="font-mono text-[10px] uppercase text-vault-muted">Workspace name</p>
            <p className="text-sm text-vault-text mt-1">{tenant?.name}</p>
            <p className="text-xs text-vault-muted mt-1">Only Admins can rename the workspace.</p>
          </div>
        )}

        <div>
          <p className="font-mono text-[10px] uppercase text-vault-muted mb-1">Workspace ID</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-vault-border bg-vault-raised px-3 py-2 font-mono text-xs text-vault-amber select-all">
              {tenant?.id ?? '—'}
            </code>
            <Button type="button" size="sm" variant="secondary" withArrow={false} onClick={() => void copyId()}>
              {copied ? 'COPIED' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-vault-muted mt-2">Team members need this ID to log in.</p>
        </div>
        {error ? (
          <p className="text-xs text-vault-danger" role="alert">
            {error}
          </p>
        ) : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-mono text-[10px] uppercase text-vault-muted">Name</p>
            <p className="text-vault-text mt-1">{currentUser?.displayName ?? '—'}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase text-vault-muted">Email</p>
            <p className="text-vault-text mt-1">{currentUser?.email ?? '—'}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase text-vault-muted">Role</p>
            <div className="mt-1">
              <Badge tone={currentUser?.role === 'Admin' ? 'amber' : 'neutral'}>
                {currentUser?.role ?? '—'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-vault-secondary">Session</h2>
        <Button type="button" size="sm" variant="danger" withArrow={false} onClick={() => void logout()}>
          Log out
        </Button>
      </Card>
    </div>
  );
};
