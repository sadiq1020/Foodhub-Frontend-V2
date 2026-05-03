"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChefHat,
  ChevronRight,
  Heart,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import logo from "../../../public/images/logo.png";
import { ModeToggle } from "./ModeToggle";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | null;
};

interface DashboardSidebarProps {
  navItems: NavItem[];
  role: "admin" | "provider" | "customer";
  children: React.ReactNode;
}

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  admin: {
    label: "Admin Panel",
    icon: Settings,
    accent: "text-violet-600 dark:text-violet-400",
    accentBg: "bg-violet-100 dark:bg-violet-950/60",
    accentActive:
      "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-l-2 border-violet-500",
    accentHover: "hover:bg-violet-50/80 dark:hover:bg-violet-950/30",
    dot: "bg-violet-500",
  },
  provider: {
    label: "Provider Hub",
    icon: ChefHat,
    accent: "text-emerald-600 dark:text-emerald-400",
    accentBg: "bg-emerald-100 dark:bg-emerald-950/60",
    accentActive:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-l-2 border-emerald-500",
    accentHover: "hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30",
    dot: "bg-emerald-500",
  },
  customer: {
    label: "My Account",
    icon: User,
    accent: "text-blue-600 dark:text-blue-400",
    accentBg: "bg-blue-100 dark:bg-blue-950/60",
    accentActive:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500",
    accentHover: "hover:bg-blue-50/80 dark:hover:bg-blue-950/30",
    dot: "bg-blue-500",
  },
};

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function NavItemRow({
  item,
  isActive,
  config,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  config: (typeof ROLE_CONFIG)[keyof typeof ROLE_CONFIG];
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
        isActive
          ? config.accentActive
          : `text-zinc-600 dark:text-zinc-400 ${config.accentHover}`,
        collapsed && "justify-center px-0"
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0 transition-transform duration-200",
          isActive ? "" : "group-hover:scale-110"
        )}
      />
      {!collapsed && (
        <span className="truncate flex-1">{item.label}</span>
      )}
      {!collapsed && item.badge != null && item.badge > 0 && (
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none",
            "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
          )}
        >
          {item.badge}
        </span>
      )}
      {!collapsed && isActive && (
        <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
      )}
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardSidebar({
  navItems,
  role,
  children,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const config = ROLE_CONFIG[role];
  const RoleIcon = config.icon;
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const user = session?.user as
    | { name: string; email: string; image?: string | null }
    | undefined;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // ── Sidebar content (shared between desktop & mobile) ──────────────────────

  const SidebarContent = ({
    isMobile = false,
  }: {
    isMobile?: boolean;
  }) => (
    <div className="flex flex-col h-full">
      {/* Logo + Role badge */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-zinc-200 dark:border-zinc-800/60",
          collapsed && !isMobile && "justify-center px-2"
        )}
      >
        {(!collapsed || isMobile) && (
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image
              src={logo}
              alt="FoodHub"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="font-bold text-base text-zinc-900 dark:text-zinc-50 tracking-tight">
              FoodHub
            </span>
          </Link>
        )}
        {collapsed && !isMobile && (
          <Link href="/">
            <Image
              src={logo}
              alt="FoodHub"
              width={28}
              height={28}
              className="rounded-lg"
            />
          </Link>
        )}
        {(!collapsed || isMobile) && (
          <span
            className={cn(
              "ml-auto text-[10px] font-semibold px-2 py-1 rounded-full tracking-wide uppercase",
              config.accentBg,
              config.accent
            )}
          >
            {role}
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto py-4 px-3 space-y-0.5",
          collapsed && !isMobile && "px-2"
        )}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role === "admin" ? "admin" : role === "provider" ? "provider" : ""}` &&
              pathname.startsWith(item.href));
          return (
            <NavItemRow
              key={item.href}
              item={item}
              isActive={isActive}
              config={config}
              collapsed={collapsed && !isMobile}
              onClick={isMobile ? () => setMobileOpen(false) : undefined}
            />
          );
        })}
      </nav>

      {/* Bottom: user + actions */}
      <div
        className={cn(
          "border-t border-zinc-200 dark:border-zinc-800/60 p-3",
          collapsed && !isMobile && "px-2"
        )}
      >
        {/* Mode toggle row */}
        {(!collapsed || isMobile) && (
          <div className="flex items-center justify-between px-1 mb-3">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Theme
            </span>
            <ModeToggle />
          </div>
        )}

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors duration-150 group",
                collapsed && !isMobile && "justify-center px-0"
              )}
            >
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-xs font-semibold",
                    config.accentBg,
                    config.accent
                  )}
                >
                  {user?.name ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || isMobile) && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate leading-tight">
                      {user?.name ?? "User"}
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                      {user?.email ?? ""}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 opacity-60 shrink-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-52 mb-1"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal pb-1">
              <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate">
                {user?.name}
              </div>
              <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={
                  role === "customer"
                    ? "/profile"
                    : `/${role}/profile`
                }
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <RoleIcon className="w-4 h-4 mr-2" />
                Back to site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    // Full-screen fixed overlay — sits above root layout Navbar/Footer
    <div className="fixed inset-0 z-50 flex bg-zinc-50 dark:bg-zinc-950">
      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/60 overflow-hidden relative"
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 z-10 shadow-sm"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-3 h-3" />
          </motion.div>
        </button>
      </motion.aside>

      {/* ── Mobile overlay backdrop ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/60 md:hidden flex flex-col shadow-2xl"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent isMobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main content area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile only) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800/60 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <Image src={logo} alt="FoodHub" width={24} height={24} className="rounded-md" />
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
              FoodHub
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full focus:outline-none">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={cn(
                        "text-xs font-semibold",
                        config.accentBg,
                        config.accent
                      )}
                    >
                      {user?.name ? getInitials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" sideOffset={6}>
                <DropdownMenuLabel className="font-normal pb-1">
                  <div className="font-semibold text-sm truncate">{user?.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={role === "customer" ? "/profile" : `/${role}/profile`} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">
                    <RoleIcon className="w-4 h-4 mr-2" />
                    Back to site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Re-export icons so layout files don't need to import lucide ──────────────
export {
  ChefHat, Heart, LayoutDashboard, List, Package, Settings, ShoppingBag, Store, User, UserCog, Users
};

