'use client';

/**
 * Admin -> Payments
 * ---------------------------------------------------------------------------
 * Panel me ab tak payment ka koi section nahi tha — paisa sirf order ke andar
 * dikhta tha. Ye page saare Razorpay records ek jagah dikhata hai (EMD,
 * fixed-price purchase, auction final payment), status/purpose filter ke
 * saath. Data: GET /payments/admin/all (permission: transactions:view)
 * ---------------------------------------------------------------------------
 */

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { WalletIcon } from '@/components/ui/Icons';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'created', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const PURPOSE_TABS = [
  { value: 'all', label: 'All purposes' },
  { value: 'fixed_price_purchase', label: 'Fixed price' },
  { value: 'auction_final_payment', label: 'Auction final' },
  { value: 'buyer_emd', label: 'Buyer EMD' },
  { value: 'seller_emd', label: 'Seller EMD' },
];

const PURPOSE_LABEL = {
  buyer_emd: 'Buyer EMD',
  seller_emd: 'Seller EMD',
  fixed_price_purchase: 'Fixed price purchase',
  auction_final_payment: 'Auction final payment',
};

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState('all');
  const [purpose, setPurpose] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get(
        `/payments/admin/all?status=${status}&purpose=${purpose}&page=${page}&limit=25`,
        'admin'
      );
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [status, purpose, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  const items = data?.items || [];
  const summary = data?.summary;

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Har Razorpay transaction — EMD, fixed-price purchase aur auction final payment."
      />

      {summary && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card padding="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total collected</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatPaise(summary.paidPaise)}</p>
            <p className="text-xs text-slate-500">{summary.paidCount} successful payments</p>
          </Card>
          <Card padding="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pending</p>
            <p className="mt-1 text-xl font-bold text-amber-600">{summary.createdCount}</p>
            <p className="text-xs text-slate-500">Razorpay order bana, payment confirm nahi hui</p>
          </Card>
          <Card padding="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Failed</p>
            <p className="mt-1 text-xl font-bold text-red-600">{summary.failedCount}</p>
            <p className="text-xs text-slate-500">Payment fail ya cancel hui</p>
          </Card>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              status === tab.value
                ? 'bg-brand-500 text-ink-900 shadow-sm shadow-brand-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {PURPOSE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setPurpose(tab.value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              purpose === tab.value
                ? 'bg-brand-500 text-ink-900'
                : 'bg-surface text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && items.length === 0 && (
        <EmptyState
          icon={WalletIcon}
          title="No payments found"
          description="Is filter me abhi koi payment record nahi hai."
        />
      )}

      {!loading && items.length > 0 && (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Razorpay IDs</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((p) => (
                  <tr key={p._id} className="align-top">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {PURPOSE_LABEL[p.purpose] || p.purpose}
                      <span className="block text-slate-400">{p.referenceType}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.userId?.fullName}
                      <span className="block text-slate-400">{p.userId?.email || p.userId?.phone}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatPaise(p.amountPaise)}</td>
                    <td className="px-4 py-3">
                      <Badge status={p.status}>{p.status === 'created' ? 'pending' : p.status}</Badge>
                      {p.failureReason && <span className="mt-1 block text-red-600">{p.failureReason}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {p.razorpayOrderId}
                      <span className="block">{p.razorpayPaymentId || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(p.paidAt || p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {data.page} of {data.totalPages} — {data.total} records
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
