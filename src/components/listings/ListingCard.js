import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatPaise } from '@/lib/money';

export default function ListingCard({ listing }) {
  const coverImage = listing.media?.[0];

  return (
    <Link href={`/listings/${listing.slug || listing._id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${coverImage.fileKey}`}
              alt={listing.title}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            'No photo available'
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900">{listing.title}</h3>
          <Badge status={listing.listingType === 'auction' ? 'live' : 'active'}>
            {listing.listingType === 'auction' ? 'Auction' : 'Fixed Price'}
          </Badge>
        </div>

        <p className="mt-2 text-base font-semibold text-emerald-800">
          {listing.listingType === 'fixed_price'
            ? formatPaise(listing.fixedPricePaise)
            : 'Bidding in progress'}
        </p>

        {listing.location?.state && (
          <p className="mt-1 text-xs text-gray-500">{listing.location.state}</p>
        )}
      </Card>
    </Link>
  );
}
