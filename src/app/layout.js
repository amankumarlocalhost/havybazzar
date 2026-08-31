import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Heavy Bazar",
  description: "Heavy equipment marketplace for buying, selling, and auctioning construction equipment.",
};

/**
 * Root layout jaan-boojh kar MINIMAL rakha hai — sirf html/body/fonts.
 * Buyer/seller ka Navbar + AuthProvider `(site)/layout.js` me hai, aur
 * admin ka alag chrome `admin/layout.js` me hoga. Isse dono sections
 * ka UI aur auth context poori tarah alag rehta hai — bilkul jaisa
 * backend me User aur AdminUser alag models the.
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      /*
       * Neeche wala inline script hydration se PEHLE `<html>` pe `hb-intro`
       * class lagata hai, isliye server ka className client se jaan-boojh kar
       * alag hota hai. React ise mismatch samajh ke warn karta hai — is ek
       * element ke attributes ke liye wo warning suppress kar rahe hain
       * (yahi tareeka theme/no-flash scripts me standard hai). Ye sirf is
       * element tak seemit hai, children pe koi asar nahi.
       */
      suppressHydrationWarning
    >
      <head>
        {/*
          Intro gate — hydration se PEHLE chalta hai. Session me pehli baar
          aane pe `<html>` pe `hb-intro` class lag jaati hai, jisse
          BrandIntro ka overlay pehle hi paint pe visible hota hai. Dobara
          aane pe class nahi lagti, isliye overlay kabhi paint hi nahi hota
          — na intro ka flash, na homepage ka.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!sessionStorage.getItem('hb:intro-seen'))document.documentElement.classList.add('hb-intro')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
