'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/admin/dashboard/stats', 'admin')
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium text-gray-900">Overview</h2>

      {stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <p className="text-xs text-gray-500">Total Buyers</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.users.totalBuyers}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Total Sellers</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.users.totalSellers}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Active Listings</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.listings.active}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Pending Review</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.listings.pendingReview}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">KYC Pending</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.kyc.pending}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Live Auctions</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.auctions.live}</p>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Loading stats...</p>
      )}
    </div>
  );
}
