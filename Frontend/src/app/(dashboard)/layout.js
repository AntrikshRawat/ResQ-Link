import DashboardShell from "@/components/layout/DashboardShell";
import AdminGuard from "@/components/auth/AdminGuard";

export const metadata = {
  title: "ResQ-Link | Staff Dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <AdminGuard>
      <DashboardShell>{children}</DashboardShell>
    </AdminGuard>
  );
}
