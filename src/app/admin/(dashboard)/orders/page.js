'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { PackageIcon, EyeIcon } from '@/components/ui/Icons';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get(`/orders/admin/all?status=${status}&limit=50`, 'admin');
      setItems(result.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus }, 'admin');
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Orders" description="All buyer orders — update shipping/delivery status here." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
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

      {loading && <Spinner />}

      {!loading && items.length === 0 && (
        <EmptyState
          icon={PackageIcon}
          title="No orders found"
          description="There are no orders in this status right now."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((order) => (
            <Card key={order._id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{order.listingId?.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Order #{order.orderNumber} — {order.orderType === 'auction_win' ? 'Auction' : 'Fixed Price'}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>

                  <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-slate-500 sm:grid-cols-2">
                    <p>
                      Buyer: <span className="text-slate-700">{order.buyerId?.fullName}</span> (
                      {order.buyerId?.email || order.buyerId?.phone})
                    </p>
                    <p>
                      Seller: <span className="text-slate-700">{order.sellerId?.fullName}</span> (
                      {order.sellerId?.email || order.sellerId?.phone})
                    </p>
                  </div>

                  {order.shippingAddress && (
                    <p className="mt-2 text-xs text-slate-500">
                      Ship to: {order.shippingAddress.line1}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} — {order.shippingAddress.pincode}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge status={order.status}>{order.status}</Badge>
                  <p className="text-sm font-bold text-slate-900">{formatPaise(order.totalAmountPaise)}</p>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    className="w-40"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </Select>

                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-800"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View details
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
