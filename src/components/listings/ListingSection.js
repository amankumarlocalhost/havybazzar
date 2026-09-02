import Link from 'next/link';
import ListingCard from './ListingCard';
import { ListingGridSkeleton } from '@/components/ui/Skeleton';
import { ArrowRightIcon } from '@/components/ui/Icons';

/**
 * ListingSection — homepage ka ek shelf (Latest / Featured / Popular).
 * ---------------------------------------------------------------------------
 * Teeno shelves ek hi component se aate hain, aur card wahi purana ListingCard
 * hai — koi duplicate card markup nahi. Sirf heading, subtitle, "View all" ka
 * href aur optional ribbon badge alag hote hain.
 *
 * Grid har jagah same hai: mobile 1, tablet 2, desktop 4. `items-stretch` +
 * card ka `h-full` milkar row me sab cards ki height barabar rakhte hain.
 * ---------------------------------------------------------------------------
 */
export default function ListingSection({
  title,
  subtitle,
  href,
  listings = [],
  ribbon,
  loading = false,
  className = '',
}) {
  // Loading ke alawa khaali shelf render karne ka koi matlab nahi — homepage pe
  // ek adhoora heading chhodne se accha hai section hi na dikhe.
  if (!loading && listings.length === 0) return null;

  return (
    <section className={`mb-12 ${className}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="hb-section-title text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mt-1 pl-3.5 text-sm text-slate-500">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
        >
          View all
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <ListingGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} ribbon={ribbon} />
          ))}
        </div>
      )}
    </section>
  );
}
