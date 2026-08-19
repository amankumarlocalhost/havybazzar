'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import ListingCard from '@/components/listings/ListingCard';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        // Dono public endpoints hain — login ki zaroorat nahi
        const [categoriesData, listingsData] = await Promise.all([
          api.get('/categories'),
          api.get('/listings/browse?sort=newest&limit=8'),
        ]);
        setCategories(categoriesData);
        setListings(listingsData.items);
      } catch (err) {
        // Backend abhi na chal raha ho to bhi page crash nahi hona chahiye —
        // sirf ek friendly message dikhega
        setError('Unable to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="mb-10 rounded-2xl bg-emerald-800 px-8 py-12 text-white">
        <h1 className="text-3xl font-semibold">The trusted marketplace for heavy equipment</h1>
        <p className="mt-2 max-w-xl text-emerald-100">
          Excavators, cranes, and construction equipment — buy directly or bid in a live auction.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/listings">
            <Button variant="secondary">Browse equipment</Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/listings?categoryId=${cat._id}`}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
              >
                {cat.name?.en}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Listings */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-gray-900">New listings</h2>

        {loading && <Spinner />}

        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && listings.length === 0 && (
          <p className="text-sm text-gray-500">No listings available right now.</p>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
