'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Spinner from '@/components/ui/Spinner';
import { ClipboardListIcon, ClockIcon, CheckCircleIcon, TagIcon } from '@/components/ui/Icons';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    async function loadCounts() {
      try {
        const [draft, underReview, active, sold] = await Promise.all([
          api.get('/listings/mine?status=draft&limit=1', 'user'),
          api.get('/listings/mine?status=under_review&limit=1', 'user'),
          api.get('/listings/mine?status=active&limit=1', 'user'),
          api.get('/listings/mine?status=sold&limit=1', 'user'),
        ]);
        setCounts({
          draft: draft.total,
          underReview: underReview.total,
          active: active.total,
          sold: sold.total,
        });
      } catch {
        // If dashboard stats fail to load, the page should not crash.
      }
    }
    loadCounts();
  }, []);

  return (
    <div>
      <PageHeader title="Seller Dashboard" description={`Welcome, ${user.fullName}`} />

      {counts ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={ClipboardListIcon} label="Draft" value={counts.draft} tone="slate" />
          <StatCard icon={ClockIcon} label="Under Review" value={counts.underReview} tone="amber" />
          <StatCard icon={CheckCircleIcon} label="Active" value={counts.active} tone="emerald" />
          <StatCard icon={TagIcon} label="Sold" value={counts.sold} tone="emerald" />
        </div>
      ) : (
        <Spinner />
      )}

      <p className="mt-8 text-sm text-slate-400">
        Revenue graphs and reports will be added to this dashboard in a future phase.
      </p>
    </div>
  );
}
