import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-100">{children}</div>
    </AdminAuthProvider>
  );
}
