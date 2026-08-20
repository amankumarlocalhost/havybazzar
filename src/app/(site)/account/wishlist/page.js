'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import ListingCard from '@/components/listings/ListingCard';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { HeartIcon } from '@/components/ui/Icons';

export default function WishlistPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await api.get('/listings/wishlist/mine', 'user');
      setListings(result);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Wishlist" description="Equipment you have saved for later." />

      {listings.length === 0 ? (
        <EmptyState
          icon={HeartIcon}
          title="Your wishlist is empty"
          description="Save listings you're interested in and they'll show up here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              initialWishlisted
              onWishlistChange={(added) => {
                if (!added) setListings((prev) => prev.filter((l) => l._id !== listing._id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
