import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-slate-50">{children}</div>
    </AdminAuthProvider>
  );
}
