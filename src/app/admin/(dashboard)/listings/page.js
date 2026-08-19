'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { PackageIcon } from '@/components/ui/Icons';

const STATUS_TABS = [
  { value: 'under_review', label: 'Under Review' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminListingsPage() {
  const [status, setStatus] = useState('under_review');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get(`/listings/admin/all?status=${status}&limit=50`, 'admin');
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

  async function handleApprove(listingId) {
    setActing(true);
    try {
      await api.post(`/listings/admin/${listingId}/review`, { action: 'approve' }, 'admin');
      load();
    } finally {
      setActing(false);
    }
  }

  async function handleReject(listingId) {
    if (!reason.trim()) return;
    setActing(true);
    try {
      await api.post(`/listings/admin/${listingId}/review`, { action: 'reject', reason }, 'admin');
      setRejectingId(null);
      setReason('');
      load();
    } finally {
      setActing(false);
    }
  }

  return (
    <div>
      <PageHeader title="Listings" description="Moderate marketplace listings awaiting review." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              status === tab.value
                ? 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/30'
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
          title="No listings found"
          description="There are no listings in this status right now."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((listing) => (
            <Card key={listing._id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{listing.title}</p>
                  <p className="text-xs text-slate-500">
                    {listing.sellerId?.fullName} — {listing.categoryId?.name?.en}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {listing.listingType === 'fixed_price' ? formatPaise(listing.fixedPricePaise) : 'Auction'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={listing.status}>{listing.status}</Badge>
                  <Link href={`/listings/${listing.slug || listing._id}`} target="_blank">
                    <Button variant="ghost">View</Button>
                  </Link>
                  {status === 'under_review' && (
                    <>
                      <Button onClick={() => handleApprove(listing._id)} loading={acting}>
                        Approve
                      </Button>
                      <Button variant="danger" onClick={() => setRejectingId(listing._id)}>
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {rejectingId === listing._id && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    rows={2}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button variant="danger" onClick={() => handleReject(listing._id)} loading={acting}>
                      Confirm Reject
                    </Button>
                    <Button variant="ghost" onClick={() => setRejectingId(null)}>
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
