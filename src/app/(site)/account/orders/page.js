'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import { getUserToken } from '@/lib/tokenStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { PackageIcon } from '@/components/ui/Icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const STATUS_STEPS = ['processing', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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

  async function handleDownloadInvoice(orderId) {
    setDownloadingId(orderId);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/invoice/download`, {
        headers: { Authorization: `Bearer ${getUserToken()}` },
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'invoice.pdf';
      link.click();
      URL.revokeObjectURL(url);
      load();
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Orders" description="Your purchases and completed auction wins." />

      {orders.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="You have no orders yet"
          description="Your completed purchases will appear here."
          action={
            <Link href="/listings">
              <Button variant="secondary">Browse Equipment</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const stepIndex = STATUS_STEPS.indexOf(order.status);
            const isTerminalBad = ['cancelled', 'refunded'].includes(order.status);

            return (
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

                {!isTerminalBad && (
                  <div className="mt-4 flex items-center gap-2">
                    {STATUS_STEPS.map((step, i) => (
                      <div
                        key={step}
                        className={`h-2 flex-1 rounded-full ${i <= stepIndex ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                )}
                {!isTerminalBad && (
                  <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-400">
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
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
                  <Button
                    variant="ghost"
                    onClick={() => handleDownloadInvoice(order._id)}
                    loading={downloadingId === order._id}
                  >
                    Download Invoice (PDF)
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
