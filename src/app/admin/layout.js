import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-ink-900">{children}</div>
    </AdminAuthProvider>
  );
}
