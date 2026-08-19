'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import { UserIcon, ShieldCheckIcon } from '@/components/ui/Icons';

export default function ProfilePage() {
  const { user, switchRole } = useAuth();
  const [becomingSeller, setBecomingSeller] = useState(false);
  const [roleError, setRoleError] = useState('');

  const isSeller = user.roles?.includes('seller');
  const isBuyer = user.roles?.includes('buyer');

  async function handleBecomeSeller() {
    setRoleError('');
    setBecomingSeller(true);
    try {
      // The backend's switchRole() adds the seller role automatically when the
      // target is 'seller' — but only if user.kycStatus is 'verified'
      // (auth.service.js). Otherwise it returns a 403.
      await switchRole('seller');
    } catch (err) {
      setRoleError(err.message || 'Something went wrong while becoming a seller');
    } finally {
      setBecomingSeller(false);
    }
  }

  return (
    <div>
      <PageHeader title="Profile" description="Your account details and role settings." />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</p>
              <p className="text-base font-semibold text-slate-900">{user.fullName}</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email / Phone</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{user.email || user.phone}</p>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Roles</p>
          <p className="mt-1 text-base font-semibold capitalize text-slate-900">{user.roles?.join(', ')}</p>
          <p className="mt-1 text-xs text-slate-400">Active: {user.activeRole}</p>

          {isSeller && isBuyer && (
            <div className="mt-4 flex gap-2">
              <Button
                variant={user.activeRole === 'buyer' ? 'primary' : 'secondary'}
                onClick={() => switchRole('buyer')}
              >
                Buyer mode
              </Button>
              <Button
                variant={user.activeRole === 'seller' ? 'primary' : 'secondary'}
                onClick={() => switchRole('seller')}
              >
                Seller mode
              </Button>
            </div>
          )}

          {!isSeller && user.kycStatus === 'verified' && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-slate-500">
                You are currently a buyer only. Add the seller role to start selling equipment.
              </p>
              <Button onClick={handleBecomeSeller} loading={becomingSeller}>
                Become a Seller
              </Button>
              {roleError && <p className="mt-2 text-sm text-red-600">{roleError}</p>}
            </div>
          )}

          {!isSeller && user.kycStatus !== 'verified' && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-slate-500">
                You need to complete KYC verification before becoming a seller.
              </p>
              <Link href="/account/kyc">
                <Button variant="secondary">Complete KYC</Button>
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">KYC Status</p>
                <div className="mt-1">
                  <Badge status={user.kycStatus}>{user.kycStatus}</Badge>
                </div>
              </div>
            </div>
            <Link href="/account/kyc">
              <Button variant="secondary">
                {user.kycStatus === 'verified' ? 'View Details' : 'Complete KYC'}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
