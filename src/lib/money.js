/**
 * money.js
 * ---------------------------------------------------------------------------
 * Backend HAMESHA paise me integer bhejta hai (SCHEMA_NOTES.md ka rule —
 * float kabhi nahi). Frontend me kahin bhi price dikhana ho, isi function
 * se guzariye — kabhi seedha `paise / 100` likh ke `₹` na lagayein,
 * currency formatting (commas, decimals) yahi handle karta hai.
 * ---------------------------------------------------------------------------
 */

export function formatPaise(paise) {
  if (paise == null) return '—';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

// Payment gateway (Razorpay) ko bhejne ke liye rupees -> paise
export function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}
