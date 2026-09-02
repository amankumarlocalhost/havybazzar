'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { buildHomeSections } from '@/lib/listings';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import ListingSection from '@/components/listings/ListingSection';
import MarketplaceHero from '@/components/site/MarketplaceHero';
import CategoryTiles from '@/components/site/CategoryTiles';
import {
  ShieldCheckIcon,
  GavelIcon,
  TruckIcon,
  ClockIcon,
  InboxIcon,
} from '@/components/ui/Icons';

const VALUE_PROPS = [
  {
    icon: ShieldCheckIcon,
    title: 'Verified sellers',
    description: 'Every seller completes a KYC and business verification before listing equipment.',
  },
  {
    icon: GavelIcon,
    title: 'Transparent auctions',
    description: 'Live bidding with real-time updates, EMD protection, and a clear reserve process.',
  },
  {
    icon: TruckIcon,
    title: 'Nationwide reach',
    description: 'Browse and buy equipment from sellers across the country, delivered to your site.',
  },
  {
    icon: ClockIcon,
    title: 'Fast transactions',
    description: 'Secure payments and instant order confirmation — no back-and-forth negotiations.',
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [categoriesData, listingsData] = await Promise.all([
          api.get('/categories'),
          api.get('/listings/browse?sort=newest&limit=24'),
        ]);
        setCategories(categoriesData);
        setListings(listingsData.items);
      } catch {
        setError('Unable to load listings. Please try again later.');
      } finally {
        setLoading(false);
        // BrandIntro ko batao ki homepage ka critical data aa gaya — isse
        // intro data ka wait karta hai, apni koi extra request nahi karta.
        window.dispatchEvent(new Event('hb:app-ready'));
      }
    }
    loadHomeData();
  }, []);

  // Teeno shelves EK hi browse response se nikalte hain — koi extra API call
  // nahi. Dedupe bhi yahin hota hai (dekhein lib/listings.js).
  const { latest, featured, popular } = useMemo(
    () => buildHomeSections(listings),
    [listings]
  );

  return (
    <div>
      <MarketplaceHero categories={categories} />

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6">
        <CategoryTiles categories={categories} />

        {/*
          Marketplace shelves. Teeno ek hi ListingSection component se aate
          hain aur wahi purana ListingCard use karte hain — sirf ranking,
          copy, ribbon aur "View all" ka filter alag hai.
        */}
        {error && <Alert tone="error" className="mb-8">{error}</Alert>}

        {!error && !loading && listings.length === 0 && (
          <EmptyState
            icon={InboxIcon}
            title="No listings available right now"
            description="Check back soon — new equipment is added regularly."
            action={
              <Link href="/seller/listings/new">
                <Button variant="secondary">List your equipment</Button>
              </Link>
            }
          />
        )}

        {!error && (loading || listings.length > 0) && (
          <>
            <ListingSection
              title="Latest listings"
              subtitle="Freshly added equipment from verified sellers."
              href="/listings?filter=latest"
              listings={latest}
              loading={loading}
            />
            <ListingSection
              title="Featured equipment"
              subtitle="Handpicked equipment from trusted sellers."
              href="/listings?filter=featured"
              listings={featured}
              ribbon="Featured"
              loading={loading}
            />
            <ListingSection
              title="Popular equipment"
              subtitle="Explore equipment buyers are looking for right now."
              href="/listings?filter=popular"
              listings={popular}
              ribbon="Top pick"
              loading={loading}
            />
          </>
        )}
        {/* Why Heavy Bazar */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Why choose Heavy Bazar
            </h2>
            <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
              Built for buyers and sellers who need a reliable way to trade heavy equipment.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-surface p-6 text-center shadow-sm"
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Seller CTA */}
        <section className="overflow-hidden rounded-2xl bg-ink-900 px-8 py-12 text-center sm:px-14">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Have equipment to sell?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">
            List your equipment for a fixed price or start a live auction — reach verified buyers
            across the country in minutes.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/seller/listings/new">
              <Button size="lg">Start selling</Button>
            </Link>
            <Link href="/account">
              <Button variant="outlineOnDark" size="lg">
                Learn more
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
