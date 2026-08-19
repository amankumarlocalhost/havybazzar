'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { WalletIcon, ClipboardListIcon } from '@/components/ui/Icons';

const TXN_LABELS = {
  coin_credit: 'Credit',
  coin_debit: 'Debit',
  sale_credit: 'Sale Proceeds',
};

export default function WalletPage() {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [historyData, withdrawalsData] = await Promise.all([
        api.get('/wallet/history', 'user'),
        api.get('/withdrawals/mine', 'user'),
      ]);
      setBalance(historyData.currentBalancePaise);
      setHistory(historyData.items);
      setWithdrawals(withdrawalsData);
    } catch {
      // The wallet may simply be empty — no need to show an error.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard data-fetch-on-mount pattern
    load();
  }, [load]);

  async function handleWithdraw(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/withdrawals', { amount: Number(amount), bankAccountNumber, bankIfsc }, 'user');
      setAmount('');
      setBankAccountNumber('');
      setBankIfsc('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Wallet" description="Your HB Coins balance and transaction history." />

      <Card className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <WalletIcon className="h-4 w-4 text-amber-600" />
              HB Coins Balance
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{formatPaise(balance)}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Withdraw'}</Button>
        </div>

        {showForm && (
          <form onSubmit={handleWithdraw} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <Input
              label="Amount (₹) — minimum ₹100"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input
              label="Bank Account Number"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              required
            />
            <Input
              label="IFSC Code"
              value={bankIfsc}
              onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0001234"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={submitting}>
              Send Request
            </Button>
          </form>
        )}
      </Card>

      {withdrawals.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Withdrawal Requests</h3>
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <Card key={w._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">{formatPaise(w.amountPaise)}</span>
                <Badge status={w.status}>{w.status}</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h3 className="mb-3 text-sm font-semibold text-slate-900">Transaction History</h3>
      {history.length === 0 ? (
        <EmptyState icon={ClipboardListIcon} title="You have no transactions yet" />
      ) : (
        <div className="space-y-2">
          {history.map((txn) => (
            <Card key={txn._id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{TXN_LABELS[txn.type] || txn.type}</p>
                <p className="text-xs text-slate-400">{txn.description}</p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  txn.direction === 'credit' ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {txn.direction === 'credit' ? '+' : '-'}
                {formatPaise(txn.amountPaise)}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
