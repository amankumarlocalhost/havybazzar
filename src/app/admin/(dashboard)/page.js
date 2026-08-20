'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { UsersIcon, PackageIcon, ClipboardListIcon, RupeeIcon } from '@/components/ui/Icons';

const REFRESH_MS = 15000; // "live" update — poll every 15s

function formatPaiseShort(paise) {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}k`;
  return `₹${rupees.toFixed(0)}`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [statsResult, trendResult] = await Promise.all([
        api.get('/admin/dashboard/stats', 'admin'),
        api.get('/admin/dashboard/revenue-trend?weeks=5', 'admin'),
      ]);
      setStats(statsResult);
      setTrend(trendResult);
      setLastUpdated(new Date());
    } catch {
      // silent — keep showing last known values, retry on next tick
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
    timerRef.current = setInterval(load, REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [load]);

  const chartData = (trend || []).map((w) => ({ label: w.label, revenue: w.revenuePaise / 100 }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening today,{' '}
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
        </div>
        {lastUpdated && (
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live — updated {lastUpdated.toLocaleTimeString('en-IN')}
          </p>
        )}
      </div>

      {!stats ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={UsersIcon} label="Total Users" value={stats.totalUsers.toLocaleString('en-IN')} tone="brand" />
            <StatCard
              icon={PackageIcon}
              label="Total Equipment Listed"
              value={stats.totalDevices.toLocaleString('en-IN')}
              tone="amber"
            />
            <StatCard
              icon={ClipboardListIcon}
              label="Total Orders"
              value={stats.totalOrders.toLocaleString('en-IN')}
              tone="slate"
            />
            <StatCard
              icon={RupeeIcon}
              label="Total Revenue (Admin)"
              value={formatPaise(stats.totalRevenuePaise)}
              tone="emerald"
            />
          </div>

          <Card className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Revenue Details</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                Last {chartData.length || 5} weeks
              </span>
            </div>

            {chartData.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No revenue data yet.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => formatPaiseShort(v * 100)}
                    />
                    <Tooltip
                      formatter={(value) => [formatPaiseShort(value * 100), 'Revenue']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fill="url(#revenueFill)"
                      dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Buyers" value={stats.users.totalBuyers.toLocaleString('en-IN')} />
            <StatCard label="Total Sellers" value={stats.users.totalSellers.toLocaleString('en-IN')} />
            <StatCard label="Active Listings" value={stats.listings.active.toLocaleString('en-IN')} />
            <StatCard label="Pending Review" value={stats.listings.pendingReview.toLocaleString('en-IN')} />
            <StatCard label="KYC Pending" value={stats.kyc.pending.toLocaleString('en-IN')} />
            <StatCard label="Live Auctions" value={stats.auctions.live.toLocaleString('en-IN')} />
            <StatCard label="Scheduled Auctions" value={stats.auctions.upcoming.toLocaleString('en-IN')} />
          </div>
        </>
      )}
    </div>
  );
}
