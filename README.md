# Heavy Bazar Frontend

Next.js (JavaScript, App Router, Tailwind CSS v4). Backend se poori tarah
connected — heavy-bazar-backend chahiye chalane ke liye.

## Setup

```bash
npm install
cp .env.local.example .env.local
# .env.local me NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME apna daaliye (photos dikhane ke liye)
npm run dev
```

Backend alag terminal me chalna chahiye (http://localhost:5000) — dono
saath chalne chahiye.

Khulega: http://localhost:3000

## Folder structure

```
src/
  app/
    layout.js              # Root layout — sirf html/body/fonts (minimal)
    (site)/                # Buyer + Seller — apna Navbar + AuthProvider
      layout.js
      page.js               # Landing page
      login/, signup/       # Auth
      listings/             # Browse
      account/              # Buyer profile
      seller/               # Seller dashboard
    admin/                  # Admin — ALAG AuthProvider (AdminAuthContext)
      layout.js
      login/
      page.js               # Dashboard

  context/
    AuthContext.js          # Buyer/seller login state — in-memory token + silent refresh
    AdminAuthContext.js      # Admin login state — localStorage token

  lib/
    api.js                  # Backend se baat karne ka EK tareeka — auto token-refresh
    socket.js                # Socket.io client (live auction bidding ke liye)
    tokenStore.js             # User/admin token storage (alag-alag)
    money.js                  # Paise -> Rupee formatting

  components/
    ui/                      # Button, Input, Card, Badge, Spinner — reusable
    layout/Navbar.js
    listings/ListingCard.js
```

## Design decisions

- Buyer/seller aur Admin poori tarah alag hain — alag route group
  ((site) vs admin/), alag AuthContext, alag token storage. Backend
  me bhi User aur AdminUser alag models/JWT secrets the — frontend usi
  separation ko follow karta hai.

- User token memory me, admin token localStorage me — lib/tokenStore.js
  me poora reasoning likha hai. Short version: user ka refresh httpOnly
  cookie se hota hai (XSS-safe), admin ka backend me refresh mechanism
  hai hi nahi (single 8-hour token), isliye localStorage.

- api.js ek hi jagah se sab kuch — kahin bhi seedha fetch() mat
  kijiye. Ye backend ka {success, message, data} format samajhta hai,
  401 pe user token ko khud refresh karta hai.

- Backend hamesha paise me integer deta hai — lib/money.js ka
  formatPaise() hi use kijiye, kabhi seedha /100 mat kijiye.

## Test kiya gaya

npm run build aur npx eslint src/ dono clean pass — 30 routes
successfully generate hue (Phase 0-4 ke 23 + 7 naye Phase 5 routes).
"set-state-in-effect" rule ka pattern is baar 3 jagah galat-positive
tha (unused disable warning) aur 1 jagah asli error — dono fix kiye.

**Test NAHI ho paya:** real backend se connect karke live data — sandbox
environment me MongoDB Atlas se connect nahi ho sakta (backend ke
SCHEMA_NOTES.md me detail hai). Apne system pe backend + frontend dono
chalake khud test kariye.

## Ab tak kya bana (Phase 0 + Phase 1)

**Phase 0:**
- Project setup, Tailwind, folder structure
- API client (auto-refresh ke saath)
- Socket.io client wrapper
- Auth contexts (user + admin, alag-alag)
- UI components (Button, Input, Card, Badge, Spinner)
- Login, Signup+OTP
- Account page (profile, role switch)
- Seller dashboard (placeholder)
- Admin login + dashboard (stats ke saath)

**Phase 1:**
- Landing page (categories + listings backend se live fetch)
- Browse/search page
- **Listing detail page** — photo/video gallery, specs (grouped), wishlist,
  related equipment, Buy Now (fixed price) ya auction link
- **Live auction bidding page** — Socket.io se real-time updates,
  countdown timer, bid + auto-bid forms, EMD join flow, winner ke liye
  final payment
- **Razorpay checkout integration** (`lib/razorpay.js`, `lib/completePayment.js`) —
  ek hi reusable flow jo 4 jagah use hota hai (buyer EMD, seller EMD,
  fixed-price purchase, auction final payment)

**Phase 2:**
- **Seller layout** — sidebar navigation, role-guard
- **Post Equipment form** — poore specs groups (general/engine/hydraulic/
  cabin/undercarriage), fixed-price ya auction config
- **My Listings** — status filter tabs, manage/remove
- **Listing edit page** — media upload (multipart), submit for review,
  seller EMD payment (auction listings)
- **Seller Auction Monitor** — live stats Socket.io se, **bidder identity
  hidden** (doc ka rule)

## Ek zaroori note

`seller/listings/[listingId]/page.js` me ek **backend gap** use ho raha
hai — backend me "get one of my listings by id" ka seedha endpoint nahi
hai, sirf list endpoint hai. Isliye frontend `/listings/mine` poori list
laata hai aur usme se ID match karta hai. Kaam karta hai, par bada scale
pe (bahut zyada listings) inefficient hoga — future me backend me
`GET /listings/mine/:id` add karna behtar rahega.

**Phase 3 me ek asli backend bug pakड़a aur fix kiya:** `GET /admin/me`
response me `permissions` array missing tha (`authenticateAdmin.js`
middleware `hasPermission` ko ek FUNCTION ke roop me set karta tha, jo
JSON response me automatically drop ho jaata hai). Iska matlab tha —
login ke turant baad permissions sahi dikhte, par **page refresh hone
pe sub-admin ke nav items ghayab ho jaate**, chahe unke paas permission
ho. Backend me fix kiya (`req.admin.permissions` explicitly add kiya),
96 backend tests dobara pass hue, backend ka naya zip banaya gaya hai.
Agar aapke paas purana backend zip hai, **naya download kar lijiye.**

**Phase 3:**
- **Admin dashboard layout** — sidebar navigation, permission-based nav
  (sub-admin sirf apne permissions wale sections dekhta hai)
- **KYC Review** — pending list, document viewer (10-min signed URLs),
  verify/reject
- **Listings Approval** — status tabs, inline approve/reject with reason
- **Manage Users** — filter/search, suspend/activate, **CSV export**
  (Authorization header ke saath blob download, plain link se nahi)
- **Sub-Admin Management** (Super Admin only) — create with permission
  checkboxes, activate/deactivate

**Phase 4:**
- **Account layout** — tab navigation (Profile, Orders, My Bids, Wallet,
  Wishlist, Notifications)
- **Orders** — status, invoice generation
- **My Bids** — auction history with status (active/outbid/won/lost)
- **Wallet** — HB Coins balance, transaction history, withdrawal request
- **Wishlist** — saved listings
- **Notifications** — mark as read / mark all read

## Agla kya banega (Phase 5+)

**Phase 5:**
- **Admin Categories** — create, parent/child, activate/deactivate
- **Admin CMS Pages** — list, edit/create (Privacy Policy, Terms, FAQ, etc)
- **Admin Support Tickets** — list, status filter, detail + reply, status change
- **Admin Reports** — sales summary, orders by status, auction activity
- **Admin Withdrawals** — approve/reject pending requests
- **Buyer Support Tickets** — create ticket, my tickets list, detail + reply

## Poora frontend scope ban chuka hai

Buyer site, Seller dashboard, aur Admin panel — teeno poori tarah
backend se connected hain, saare doc ke modules cover hote hain.
