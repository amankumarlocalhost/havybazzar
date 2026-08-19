'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { getAdminToken } from '@/lib/tokenStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [suspendingId, setSuspendingId] = useState(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      const result = await api.get(`/admin/users?${params.toString()}`, 'admin');
      setUsers(result.items);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, role, status]);

  useEffect(() => {
    const timeout = setTimeout(load, 300); // search debounce
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleActivate(userId) {
    setActing(true);
    try {
      await api.post(`/admin/users/${userId}/activate`, {}, 'admin');
      load();
    } finally {
      setActing(false);
    }
  }

  async function handleSuspend(userId) {
    if (!reason.trim()) return;
    setActing(true);
    try {
      await api.post(`/admin/users/${userId}/suspend`, { reason }, 'admin');
      setSuspendingId(null);
      setReason('');
      load();
    } finally {
      setActing(false);
    }
  }

  async function handleExportCsv() {
    // api.js wrapper JSON parse karta hai — CSV ke liye seedha fetch,
    // kyunki admin token Authorization header me chahiye (plain link se nahi bhejta)
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (status) params.set('status', status);

    const res = await fetch(`${API_URL}/admin/users/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'heavy-bazar-users.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Manage Users</h2>
        <Button variant="secondary" onClick={handleExportCsv}>
          CSV Export
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search name/email/phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {loading && <Spinner />}
      {!loading && users.length === 0 && <p className="text-sm text-gray-500">No users found.</p>}

      {!loading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u._id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.fullName}</p>
                  <p className="text-xs text-gray-500">{u.email || u.phone}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {u.roles?.join(', ')} — KYC: {u.kycStatus}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={u.status}>{u.status}</Badge>
                  {u.status === 'suspended' ? (
                    <Button onClick={() => handleActivate(u._id)} loading={acting}>
                      Activate
                    </Button>
                  ) : (
                    <Button variant="danger" onClick={() => setSuspendingId(u._id)}>
                      Suspend
                    </Button>
                  )}
                </div>
              </div>

              {suspendingId === u._id && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for suspension"
                    rows={2}
                    className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                  <div className="flex gap-2">
                    <Button variant="danger" onClick={() => handleSuspend(u._id)} loading={acting}>
                      Confirm Suspend
                    </Button>
                    <Button variant="ghost" onClick={() => setSuspendingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
