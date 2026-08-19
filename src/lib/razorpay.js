'use client';

/**
 * razorpay.js
 * ---------------------------------------------------------------------------
 * Poore app me jahan bhi payment karni ho (fixed-price purchase, buyer
 * EMD, seller EMD, auction final payment) — sab isi function se guzarte
 * hain. Backend ke `payment.service.js` ke 4 "initiate" endpoints se
 * mila `{razorpayOrderId, amountPaise, razorpayKeyId}` yahan pass kijiye.
 * ---------------------------------------------------------------------------
 */

let scriptLoadingPromise = null;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();

  if (!scriptLoadingPromise) {
    scriptLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load the Razorpay script'));
      document.body.appendChild(script);
    });
  }
  return scriptLoadingPromise;
}

/**
 * @param {object} params
 * @param {string} params.razorpayOrderId
 * @param {number} params.amountPaise
 * @param {string} params.razorpayKeyId
 * @param {string} params.name - buyer ka naam (prefill)
 * @param {string} [params.email]
 * @param {string} [params.contact]
 * @param {string} [params.description]
 * @returns {Promise<{razorpay_payment_id, razorpay_order_id, razorpay_signature}>}
 */
export async function openRazorpayCheckout({
  razorpayOrderId,
  amountPaise,
  razorpayKeyId,
  name,
  email,
  contact,
  description = 'Heavy Bazar Payment',
}) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: razorpayKeyId,
      amount: amountPaise,
      currency: 'INR',
      name: 'Heavy Bazar',
      description,
      order_id: razorpayOrderId,
      prefill: { name, email, contact },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled')),
      },
      theme: { color: '#065f46' },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment failed'));
    });
    rzp.open();
  });
}
