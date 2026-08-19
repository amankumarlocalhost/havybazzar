'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import ListingCard from '@/components/listings/ListingCard';

function BrowseContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId') || '';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ sort: 'newest', limit: '20' });
        if (categoryId) params.set('categoryId', categoryId);
        if (search) params.set('search', search);

        const result = await api.get(`/listings/browse?${params.toString()}`);
        setListings(result.items);
      } catch {
        setError('Unable to load listings.');
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [categoryId, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Browse Equipment</h1>

      <input
        type="text"
        placeholder="Search — e.g. excavator, JCB"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full max-w-md rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
      />

      {loading && <Spinner />}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && listings.length === 0 && (
        <p className="text-sm text-gray-500">No listings found.</p>
      )}

      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  // useSearchParams() ko Suspense boundary chahiye Next.js App Router me
  return (
    <Suspense fallback={<Spinner />}>
      <BrowseContent />
    </Suspense>
  );
}
