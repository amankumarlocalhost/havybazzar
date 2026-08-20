'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import { ShieldCheckIcon, AlertTriangleIcon } from '@/components/ui/Icons';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminKycListPage() {
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get(`/kyc/admin/all?status=${statusFilter}&limit=50`, 'admin');
      setItems(result.items);
    } catch (err) {
      setItems([]);
      setError(err.message || 'Failed to load KYC list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load(status);
  }, [load, status]);

  return (
    <div>
      <PageHeader title="KYC Review" description="All verification requests, past and pending." />

      <Tabs items={STATUS_TABS} value={status} onChange={setStatus} className="mb-4" />

      {loading && <Spinner />}

      {!loading && error && (
        <EmptyState
          icon={AlertTriangleIcon}
          title="Could not load KYC requests"
          description={error}
        />
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={ShieldCheckIcon}
          title="No KYC requests"
          description="Submissions matching this filter will show up here."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((kyc) => (
            <Card key={kyc._id} hover className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{kyc.userId?.fullName}</p>
                <p className="text-xs text-slate-500">{kyc.userId?.email || kyc.userId?.phone}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Submitted: {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={kyc.status} />
                <Link href={`/admin/kyc/${kyc._id}`}>
                  <Button>Review</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
