'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { WalletIcon } from '@/components/ui/Icons';

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get('/withdrawals/admin/pending?limit=50', 'admin');
      setItems(result.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleApprove(id) {
    setActing(true);
    try {
      await api.post(`/withdrawals/admin/${id}/approve`, {}, 'admin');
      load();
    } finally {
      setActing(false);
    }
  }

  async function handleReject(id) {
    if (!reason.trim()) return;
    setActing(true);
    try {
      await api.post(`/withdrawals/admin/${id}/reject`, { reason }, 'admin');
      setRejectingId(null);
      setReason('');
      load();
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Withdrawal Requests" description="Review and process pending seller withdrawal requests." />

      {items.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="No pending withdrawals"
          description="All withdrawal requests have been processed."
        />
      ) : (
        <div className="space-y-3">
          {items.map((w) => (
            <Card key={w._id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{w.userId?.fullName}</p>
                  <p className="text-xs text-slate-500">{w.userId?.email || w.userId?.phone}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Bank: {w.bankAccountNumber} — {w.bankIfsc}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">{formatPaise(w.amountPaise)}</span>
                  <Button size="sm" onClick={() => handleApprove(w._id)} loading={acting}>
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectingId(w._id)}>
                    Reject
                  </Button>
                </div>
              </div>

              {rejectingId === w._id && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for rejection"
                    rows={2}
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" onClick={() => handleReject(w._id)} loading={acting}>
                      Confirm Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>
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
