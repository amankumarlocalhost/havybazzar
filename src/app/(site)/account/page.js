'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import { UserIcon, ShieldCheckIcon, MapPinIcon } from '@/components/ui/Icons';

const EMPTY_ADDRESS = { label: '', line1: '', line2: '', city: '', state: '', country: 'India', pincode: '' };

function AddressCard({ user, updateProfile }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const existing = user.addresses?.[0];

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile({ address: form });
      setEditing(false);
      setForm(EMPTY_ADDRESS);
    } catch (err) {
      setError(err.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <MapPinIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</p>
          {existing && !editing && (
            <p className="mt-1 text-sm text-slate-900">
              {existing.line1}
              {existing.line2 ? `, ${existing.line2}` : ''}, {existing.city}, {existing.state} -{' '}
              {existing.pincode}, {existing.country}
            </p>
          )}
          {!existing && !editing && <p className="mt-1 text-sm text-slate-400">No address added yet.</p>}
        </div>
      </div>

      {!editing && (
        <Button variant="secondary" className="mt-4" onClick={() => setEditing(true)}>
          {existing ? 'Edit Address' : 'Add Address'}
        </Button>
      )}

      {editing && (
        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <Input
            label="Address Line 1"
            required
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
          />
          <Input
            label="Address Line 2"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="State"
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pincode"
              required
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
          {error && <Alert tone="error">{error}</Alert>}
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              Save Address
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function ProfilePage() {
  const { user, switchRole, updateProfile } = useAuth();
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
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
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
              {roleError && <Alert tone="error" className="mt-2">{roleError}</Alert>}
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

        <AddressCard user={user} updateProfile={updateProfile} />

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
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
