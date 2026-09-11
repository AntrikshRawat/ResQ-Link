import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "ResQ-Link | Staff Dashboard",
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
