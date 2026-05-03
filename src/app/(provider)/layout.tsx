// export default function ProviderLayout({
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
  ChefHat,
  DashboardSidebar,
  LayoutDashboard,
  ShoppingBag,
  User
} from "@/components/layout/DashboardSidebar";

const PROVIDER_NAV = [
  {
    label: "Dashboard",
    href: "/provider/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Menu",
    href: "/provider/menu",
    icon: ChefHat,
  },
  {
    label: "Orders",
    href: "/provider/orders",
    icon: ShoppingBag,
  },
  {
    label: "Profile",
    href: "/provider/profile",
    icon: User,
  },
];

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardSidebar navItems={PROVIDER_NAV} role="provider">
      {children}
    </DashboardSidebar>
  );
}