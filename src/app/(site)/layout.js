import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BrandIntro from "@/components/site/BrandIntro";

export default function SiteLayout({ children }) {
  return (
    <AuthProvider>
      {/* First-load brand intro — fixed overlay, isliye neeche ka layout
          bilkul nahi badalta. Admin panel me jaan-boojh kar nahi hai. */}
      <BrandIntro />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
