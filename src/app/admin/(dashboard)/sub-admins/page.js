'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { PlusIcon, ShieldCheckIcon, UsersIcon } from '@/components/ui/Icons';

// Matches the PERMISSION object in the backend's src/constants/enums.js —
// same naming convention (resource:action)
const ALL_PERMISSIONS = [
  'kyc:view',
  'kyc:verify',
  'listings:view',
  'listings:approve',
  'categories:manage',
  'users:view',
  'users:edit',
  'users:suspend',
  'users:export',
  'orders:view',
  'orders:manage',
  'transactions:view',
  'cms:manage',
  'support:manage',
  'reports:view',
  'withdrawals:approve',
];

export default function AdminSubAdminsPage() {
  const { admin } = useAdminAuth();
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ email: '', password: '', fullName: '', permissions: [] });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get('/admin/sub-admins', 'admin');
      setSubAdmins(result);
    } catch {
      setSubAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  function togglePermission(perm) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await api.post('/admin/sub-admins', form, 'admin');
      setForm({ email: '', password: '', fullName: '', permissions: [] });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleStatus(subAdminId, isActive) {
    await api.patch(`/admin/sub-admins/${subAdminId}/status`, { isActive: !isActive }, 'admin');
    load();
  }

  if (admin.role !== 'super_admin') {
    return (
      <EmptyState
        icon={ShieldCheckIcon}
        title="Restricted section"
        description="This section is for Super Admins only."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Sub-Admins"
        description="Manage sub-admin accounts and their permission scopes."
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? (
              'Cancel'
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                New Sub-Admin
              </>
            )}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Permissions</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_PERMISSIONS.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 transition-colors hover:border-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-amber-500 focus:ring-2 focus:ring-amber-500/30"
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" loading={creating}>
              Create Sub-Admin
            </Button>
          </form>
        </Card>
      )}

      {loading && <Spinner />}

      {!loading && subAdmins.length === 0 && (
        <EmptyState
          icon={UsersIcon}
          title="No sub-admins found"
          description="Create a sub-admin account to delegate access."
        />
      )}

      {!loading && subAdmins.length > 0 && (
        <div className="space-y-3">
          {subAdmins.map((sa) => (
            <Card key={sa._id} hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{sa.fullName}</p>
                  <p className="text-xs text-slate-500">{sa.email}</p>
                  <p className="mt-1 text-xs text-slate-400">{sa.permissions?.join(', ') || 'No permissions'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={sa.isActive ? 'active' : 'closed'}>{sa.isActive ? 'Active' : 'Inactive'}</Badge>
                  <Button
                    variant={sa.isActive ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleStatus(sa._id, sa.isActive)}
                  >
                    {sa.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
