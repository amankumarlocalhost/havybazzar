'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import { RowSkeleton } from '@/components/ui/Skeleton';
import { ClipboardListIcon, ClockIcon, CheckCircleIcon, TagIcon, PlusIcon } from '@/components/ui/Icons';

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
      <PageHeader
        title="Seller Dashboard"
        description={`Welcome back, ${user.fullName}`}
        actions={
          <Link href="/seller/listings/new">
            <Button>
              <PlusIcon className="h-4 w-4" />
              Create Listing
            </Button>
          </Link>
        }
      />

      {counts ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={ClipboardListIcon} label="Draft" value={counts.draft} tone="slate" />
          <StatCard icon={ClockIcon} label="Under Review" value={counts.underReview} tone="amber" />
          <StatCard icon={CheckCircleIcon} label="Active" value={counts.active} tone="brand" />
          <StatCard icon={TagIcon} label="Sold" value={counts.sold} tone="emerald" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-sm text-slate-500">
        Revenue graphs and performance reports will be added to this dashboard in a future phase.
      </div>
    </div>
  );
}
