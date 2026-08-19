import { api } from './api';
import { openRazorpayCheckout } from './razorpay';

/**
 * completePayment.js
 * ---------------------------------------------------------------------------
 * Backend ke payment.service.js me 4 "initiate" purposes hain (buyer EMD,
 * seller EMD, fixed-price purchase, auction final payment) — sabka
 * frontend flow SAME hai: initiate -> Razorpay checkout -> verify.
 * Isliye ek hi function, sirf `initiatePath` badalta hai.
 * ---------------------------------------------------------------------------
 */
export async function completePayment({ initiatePath, body = {}, user }) {
  const initResult = await api.post(initiatePath, body, 'user');

  const razorpayResponse = await openRazorpayCheckout({
    razorpayOrderId: initResult.razorpayOrderId,
    amountPaise: initResult.amountPaise,
    razorpayKeyId: initResult.razorpayKeyId,
    name: user?.fullName,
    email: user?.email,
    contact: user?.phone,
  });

  await api.post(
    '/payments/verify',
    {
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature,
    },
    'user'
  );

  return true;
}
