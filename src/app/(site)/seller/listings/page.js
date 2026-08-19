'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { PackageIcon, PlusIcon, GavelIcon } from '@/components/ui/Icons';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'rejected', label: 'Rejected' },
];

export default function MyListingsPage() {
  const [status, setStatus] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (status) params.set('status', status);
      const result = await api.get(`/listings/mine?${params.toString()}`, 'user');
      setListings(result.items);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    loadListings();
  }, [loadListings]);

  async function handleRemove(listingId) {
    if (!confirm('This listing will be deleted. Continue?')) return;
    try {
      await api.delete(`/listings/${listingId}`, 'user');
      loadListings();
    } catch {
      // Deletion failed silently — the user can retry.
    }
  }

  return (
    <div>
      <PageHeader
        title="My Listings"
        actions={
          <Link href="/seller/listings/new">
            <Button>
              <PlusIcon className="h-4 w-4" />
              New Listing
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
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

      {!loading && listings.length === 0 && (
        <EmptyState
          icon={PackageIcon}
          title="No listings found"
          description="Listings you post will show up here once created."
          action={
            <Link href="/seller/listings/new">
              <Button>
                <PlusIcon className="h-4 w-4" />
                Post Equipment
              </Button>
            </Link>
          }
        />
      )}

      {!loading && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing._id} hover className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{listing.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {listing.listingType === 'fixed_price'
                    ? formatPaise(listing.fixedPricePaise)
                    : 'Auction'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge status={listing.status}>{listing.status}</Badge>
                {listing.listingType === 'auction' && listing.auctionId && (
                  <Link href={`/seller/auctions/${listing.auctionId}`}>
                    <Button variant="ghost" size="sm">
                      <GavelIcon className="h-3.5 w-3.5" />
                      Auction Monitor
                    </Button>
                  </Link>
                )}
                <Link href={`/seller/listings/${listing._id}`}>
                  <Button variant="secondary" size="sm">
                    Manage
                  </Button>
                </Link>
                {['draft', 'rejected'].includes(listing.status) && (
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(listing._id)}>
                    Delete
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
