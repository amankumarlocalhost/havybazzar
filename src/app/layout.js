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
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
