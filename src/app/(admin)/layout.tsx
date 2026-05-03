// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // Just pass through children
//   // Navbar/Footer come from root layout
//   return <>{children}</>;
// }

"use client";

import {
  DashboardSidebar,
  LayoutDashboard,
  List,
  Package,
  Store,
  Users
} from "@/components/layout/DashboardSidebar";

const ADMIN_NAV = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Providers",
    href: "/admin/providers",
    icon: Store,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: List,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardSidebar navItems={ADMIN_NAV} role="admin">
      {children}
    </DashboardSidebar>
  );
}