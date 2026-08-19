'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';

const NAV_ITEMS = [
  { href: '/seller', label: 'Dashboard' },
  { href: '/seller/listings', label: 'My Listings' },
  { href: '/seller/listings/new', label: 'Post Equipment' },
];

export default function SellerLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.roles?.includes('seller')) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading || !user || !user.roles?.includes('seller')) {
    return <Spinner className="min-h-[70vh]" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr]">
        <aside>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  pathname === item.href
                    ? 'bg-emerald-50 font-medium text-emerald-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
