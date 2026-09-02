/**
 * listings.js — homepage shelves ke liye derivation logic
 * ---------------------------------------------------------------------------
 * Homepage pe teen shelves hain (Latest / Featured / Popular) par backend me
 * SIRF EK browse endpoint hai. Isliye ek hi response se teeno derive hote
 * hain — teen API calls nahi.
 *
 * IMPORTANT: yahan sirf wahi fields use hote hain jo listing model me sach me
 * hain — `createdAt`, `viewCount`, `wishlistCount`, `media`, `fixedPricePaise`.
 * Model me koi `isFeatured` flag NAHI hai, isliye "featured" ko invent karne ke
 * bajaye ek derived signal se nikala gaya hai (neeche dekhein). Jis din backend
 * asli `isFeatured` add kare, sirf `featuredScore()` badalna hoga.
 * ---------------------------------------------------------------------------
 */

/** Naya pehle. */
export function byNewest(a, b) {
  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
}

/**
 * Popularity — asli engagement counters se.
 * Wishlist ko zyada weight mila hai kyunki wo view se bahut strong intent hai
 * (koi bhi listing khol sakta hai, save sirf serious buyer karta hai).
 */
export function popularityScore(listing) {
  return (listing.viewCount || 0) + (listing.wishlistCount || 0) * 3;
}

/**
 * "Featured" = handpicked-jaisi listing, bina naya DB field banaye.
 * Do cheezein isse pehchanti hain, dono model me maujood hain:
 *   1. media count — jis seller ne 5+ photos daali hain, usne listing par
 *      mehnat ki hai; ye "trusted seller" ka sabse kareebi available signal hai.
 *   2. value — mehnga equipment shelf ko premium feel deta hai (tie-breaker).
 * Ye ek HEURISTIC hai, business rule nahi — isliye ek hi jagah likha hai.
 */
export function featuredScore(listing) {
  const mediaCount = Math.min(listing.media?.length || 0, 6);
  const priceTier = Math.log10((listing.fixedPricePaise || 0) + 1);
  return mediaCount * 10 + priceTier;
}

const RANKERS = {
  latest: (a, b) => byNewest(a, b),
  featured: (a, b) => featuredScore(b) - featuredScore(a) || byNewest(a, b),
  popular: (a, b) => popularityScore(b) - popularityScore(a) || byNewest(a, b),
};

/** Ek shelf ke hisaab se poori list ko sort karta hai (listings page isi ko use karta hai). */
export function sortForFilter(items, filter) {
  const ranker = RANKERS[filter];
  if (!ranker) return items;
  return [...items].sort(ranker);
}

/**
 * Ek hi browse response se teeno shelves banata hai.
 *
 * Shelves me OVERLAP nahi hona chahiye (warna homepage pe ek hi machine teen
 * baar dikhti). Isliye shelves order me bharti hain aur pehle use ho chuki
 * listings skip ho jaati hain — har shelf apne hi ranking se top picks leta
 * hai, bas already-shown ko chhod kar.
 *
 * Agar listings kam hain (jaise abhi 13), to baad wale shelves chhote ho sakte
 * hain — ye jaan-boojh kar hai: ek hi machine dobara dikhane se behtar hai.
 */
export function buildHomeSections(items = [], perSection = 4) {
  const used = new Set();
  const take = (filter) => {
    const picked = sortForFilter(items, filter)
      .filter((l) => !used.has(l._id))
      .slice(0, perSection);
    picked.forEach((l) => used.add(l._id));
    return picked;
  };

  return {
    latest: take('latest'),
    featured: take('featured'),
    popular: take('popular'),
  };
}
