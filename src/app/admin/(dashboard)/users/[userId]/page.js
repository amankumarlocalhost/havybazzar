'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { AlertTriangleIcon } from '@/components/ui/Icons';

function fmtDate(d) {
  return d ? new Date(d).toLocaleString('en-IN') : '—';
}

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api.get(`/admin/users/${userId}`, 'admin');
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleActivate() {
    setActing(true);
    try {
      await api.post(`/admin/users/${userId}/activate`, {}, 'admin');
      await load();
    } finally {
      setActing(false);
    }
  }

  async function handleSuspend() {
    if (!reason.trim()) return;
    setActing(true);
    try {
      await api.post(`/admin/users/${userId}/suspend`, { reason }, 'admin');
      setSuspending(false);
      setReason('');
      await load();
    } finally {
      setActing(false);
    }
  }

  async function handleMakeSeller() {
    setActing(true);
    try {
      await api.post(`/admin/users/${userId}/make-seller`, {}, 'admin');
      await load();
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Spinner />;

  if (error || !data) {
    return <EmptyState icon={AlertTriangleIcon} title="Could not load user" description={error} />;
  }

  const { profile, ordersAsBuyer, ordersAsSeller, listings, kyc } = data;

  return (
    <div>
      <PageHeader
        title={profile.fullName}
        description={profile.email || profile.phone}
        actions={<Badge status={profile.status}>{profile.status}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Profile</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-slate-500">Roles: </span>
                <span className="font-medium text-slate-800">{profile.roles?.join(', ') || '—'}</span>
              </p>
              <p>
                <span className="text-slate-500">Active Role: </span>
                <span className="font-medium text-slate-800">{profile.activeRole}</span>
              </p>
              <p>
                <span className="text-slate-500">Email Verified: </span>
                {profile.isEmailVerified ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="text-slate-500">Phone Verified: </span>
                {profile.isPhoneVerified ? 'Yes' : 'No'}
              </p>
              {profile.companyName && (
                <p>
                  <span className="text-slate-500">Company: </span>
                  {profile.companyName}
                </p>
              )}
              {profile.gstNumber && (
                <p>
                  <span className="text-slate-500">GST: </span>
                  {profile.gstNumber}
                </p>
              )}
              {profile.panNumber && (
                <p>
                  <span className="text-slate-500">PAN: </span>
                  {profile.panNumber}
                </p>
              )}
              <p>
                <span className="text-slate-500">Joined: </span>
                {fmtDate(profile.createdAt)}
              </p>
              <p>
                <span className="text-slate-500">Last Login: </span>
                {fmtDate(profile.lastLoginAt)}
              </p>
            </div>
          </Card>

          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Wallet</p>
            <p className="text-lg font-bold text-slate-900">{formatPaise(profile.walletBalancePaise)}</p>
            <p className="text-xs text-slate-500">
              Locked: {formatPaise(profile.lockedBalancePaise)} · Available:{' '}
              {formatPaise(profile.walletBalancePaise - profile.lockedBalancePaise)}
            </p>
          </Card>

          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">KYC</p>
            {kyc ? (
              <div className="space-y-1 text-sm">
                <p>
                  <Badge status={kyc.status}>{kyc.status}</Badge>
                </p>
                <p>
                  <span className="text-slate-500">Business: </span>
                  {kyc.businessName || '—'}
                </p>
                <p>
                  <span className="text-slate-500">Submitted: </span>
                  {fmtDate(kyc.submittedAt)}
                </p>
                {kyc.status === 'verified' && (
                  <p>
                    <span className="text-slate-500">Verified: </span>
                    {fmtDate(kyc.verifiedAt)}
                  </p>
                )}
                {kyc.status === 'rejected' && kyc.rejectionReason && (
                  <p className="text-red-600">Reason: {kyc.rejectionReason}</p>
                )}
                <Link href={`/admin/kyc/${kyc._id}`}>
                  <Button variant="secondary" className="mt-1 w-full">
                    View KYC
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No KYC submission yet.</p>
            )}
          </Card>

          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</p>
            <div className="space-y-2">
              {!profile.roles?.includes('seller') && profile.kycStatus === 'verified' && (
                <Button variant="secondary" className="w-full" onClick={handleMakeSeller} loading={acting}>
                  Make Seller
                </Button>
              )}
              {profile.status === 'suspended' ? (
                <Button className="w-full" onClick={handleActivate} loading={acting}>
                  Activate
                </Button>
              ) : (
                <Button variant="danger" className="w-full" onClick={() => setSuspending(true)}>
                  Suspend
                </Button>
              )}
              {suspending && (
                <div className="border-t border-slate-100 pt-3">
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for suspension"
                    rows={2}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button variant="danger" onClick={handleSuspend} loading={acting}>
                      Confirm Suspend
                    </Button>
                    <Button variant="ghost" onClick={() => setSuspending(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Listings ({listings.length})
            </p>
            {listings.length === 0 ? (
              <p className="text-sm text-slate-400">No listings posted.</p>
            ) : (
              <div className="space-y-2">
                {listings.map((l) => (
                  <Link
                    key={l._id}
                    href={`/admin/listings/${l._id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:border-brand-200 hover:bg-brand-50/30"
                  >
                    <span className="font-medium text-slate-800">{l.title}</span>
                    <Badge status={l.status}>{l.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Orders as Buyer ({ordersAsBuyer.length})
            </p>
            {ordersAsBuyer.length === 0 ? (
              <p className="text-sm text-slate-400">No purchases yet.</p>
            ) : (
              <div className="space-y-2">
                {ordersAsBuyer.map((o) => (
                  <div
                    key={o._id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">
                      {o.listingId?.title} — #{o.orderNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{formatPaise(o.totalAmountPaise)}</span>
                      <Badge status={o.status}>{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Orders as Seller ({ordersAsSeller.length})
            </p>
            {ordersAsSeller.length === 0 ? (
              <p className="text-sm text-slate-400">No sales yet.</p>
            ) : (
              <div className="space-y-2">
                {ordersAsSeller.map((o) => (
                  <div
                    key={o._id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">
                      {o.listingId?.title} — #{o.orderNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{formatPaise(o.totalAmountPaise)}</span>
                      <Badge status={o.status}>{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
