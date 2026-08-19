'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import { ClipboardListIcon, WalletIcon, TrendUpIcon } from '@/components/ui/Icons';

export default function AdminReportsPage() {
  const [sales, setSales] = useState(null);
  const [auctions, setAuctions] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [salesData, auctionsData] = await Promise.all([
        api.get('/reports/admin/sales', 'admin'),
        api.get('/reports/admin/auctions', 'admin'),
      ]);
      setSales(salesData);
      setAuctions(auctionsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Reports" description="Sales, commission, and auction performance across the marketplace." />

      <h2 className="mb-3 text-sm font-semibold text-slate-900">Sales Summary</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={ClipboardListIcon} label="Total Orders" value={sales.summary.totalOrders} tone="slate" />
        <StatCard
          icon={WalletIcon}
          label="Total Revenue"
          value={formatPaise(sales.summary.totalRevenuePaise)}
          tone="amber"
        />
        <StatCard
          icon={TrendUpIcon}
          label="Total Commission"
          value={formatPaise(sales.summary.totalCommissionPaise)}
          tone="emerald"
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-900">Orders by Status</h2>
      <div className="mb-8 flex flex-wrap gap-3">
        {sales.byStatus.map((s) => (
          <Card key={s._id} className="px-4 py-3">
            <p className="text-xs font-medium capitalize text-slate-500">{s._id}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{s.count}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-900">Auction Activity</h2>
      <div className="flex flex-wrap gap-3">
        {auctions.byStatus.map((a) => (
          <Card key={a._id} className="px-4 py-3">
            <p className="text-xs font-medium capitalize text-slate-500">{a._id}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{a.count}</p>
            <p className="text-xs text-slate-400">GMV: {formatPaise(a.totalGmvPaise)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
