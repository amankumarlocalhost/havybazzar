'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { PackageIcon } from '@/components/ui/Icons';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await api.get('/orders/mine', 'user');
      setOrders(result.items);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleGenerateInvoice(orderId) {
    setGeneratingId(orderId);
    try {
      await api.post(`/orders/${orderId}/invoice`, {}, 'user');
      load();
    } finally {
      setGeneratingId(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Orders" description="Your purchases and completed auction wins." />

      {orders.length === 0 ? (
        <EmptyState icon={PackageIcon} title="You have no orders yet" description="Your completed purchases will appear here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order._id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{order.listingId?.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Order #{order.orderNumber} — {order.orderType === 'auction_win' ? 'Auction' : 'Fixed Price'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <Badge status={order.status}>{order.status}</Badge>
                  <p className="mt-2 text-sm font-bold text-slate-900">{formatPaise(order.totalAmountPaise)}</p>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                {order.invoiceNumber ? (
                  <p className="text-xs font-medium text-emerald-700">Invoice: {order.invoiceNumber}</p>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => handleGenerateInvoice(order._id)}
                    loading={generatingId === order._id}
                  >
                    Generate Invoice
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
