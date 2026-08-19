'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SignupPage() {
  const { signup, verifySignupOtp } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleDetailsSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.email, undefined, form.password, form.fullName);
      setStep('otp'); // backend ne OTP bhej diya (email/phone pe — dev mode me console pe)

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifySignupOtp(form.email, otp);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        {step === 'details' ? (
          <>
            <h1 className="mb-1 text-xl font-semibold text-gray-900">Create your account</h1>
            <p className="mb-6 text-sm text-gray-500">Sign up as a buyer or seller — you can switch roles later</p>

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <Input
                label="Full name"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="At least 8 characters, one capital letter, one number"
                required
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" loading={loading} className="w-full">
                Send OTP
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-semibold text-gray-900">Verify OTP</h1>
            <p className="mb-6 text-sm text-gray-500">
              An OTP has been sent to {form.email}
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <Input
                label="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" loading={loading} className="w-full">
                Verify
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
