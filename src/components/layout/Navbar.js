'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-emerald-800">
          Heavy Bazar
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/listings" className="text-gray-700 hover:text-gray-900">
            Browse
          </Link>

          {loading ? null : user ? (
            <>
              {user.roles?.includes('seller') && (
                <Link href="/seller" className="text-gray-700 hover:text-gray-900">
                  Seller Dashboard
                </Link>
              )}
              <Link href="/account" className="text-gray-700 hover:text-gray-900">
                {user.fullName}
              </Link>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Login
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
