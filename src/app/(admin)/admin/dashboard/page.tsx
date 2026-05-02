"use client";

import {
  AdminCharts,
  UserBreakdownChart,
} from "@/components/admin/AdminCharts";
// import {
//   AdminCharts,
//   UserBreakdownChart,
// } from "@/components/admin/AdminCharts";
import { QuickActionCard } from "@/components/admin/QuickActionCard";
import { StatCard } from "@/components/admin/StatCard";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  List,
  Package,
  Settings,
  ShoppingBag,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type AdminStats = {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalOrders: number;
  totalCategories: number;
  providers: {
    pending: number;
    approved: number;
    rejected: number;
  };
  ordersByStatus: { name: string; value: number; fill: string }[];
  ordersLast7Days: { day: string; orders: number }[];
  userBreakdown: { name: string; value: number; fill: string }[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    if (!isPending && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== "ADMIN") router.push("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session?.user) return;
    if (hasFetched.current) return;

    const fetchStats = async () => {
      try {
        hasFetched.current = true;
        setIsLoading(true);
        const data = await api.get("/admin/stats");
        setStats(data.data || data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.id]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as { name: string; role?: string };

  return (
    <div
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950"
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <Settings className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Admin Dashboard
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                Welcome back, {user.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={Users}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-950/50"
            label="Total Users"
            value={stats?.totalUsers || 0}
            subtext={`${stats?.totalCustomers || 0} customers · ${stats?.totalProviders || 0} providers`}
            isLoading={isLoading}
          />
          <StatCard
            icon={ShoppingBag}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
            label="Total Orders"
            value={stats?.totalOrders || 0}
            isLoading={isLoading}
          />
          <StatCard
            icon={List}
            iconColor="text-violet-600 dark:text-violet-400"
            iconBgColor="bg-violet-100 dark:bg-violet-950/50"
            label="Total Categories"
            value={stats?.totalCategories || 0}
            isLoading={isLoading}
          />
          <StatCard
            icon={Store}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            label="Pending Providers"
            value={stats?.providers?.pending || 0}
            subtext={`${stats?.providers?.approved || 0} approved · ${stats?.providers?.rejected || 0} rejected`}
            isLoading={isLoading}
          />
        </div>

        {/* ── Charts ── */}
        {!isLoading && stats && (
          <>
            <AdminCharts
              ordersByStatus={stats.ordersByStatus}
              ordersLast7Days={stats.ordersLast7Days}
              userBreakdown={stats.userBreakdown}
            />
            <UserBreakdownChart userBreakdown={stats.userBreakdown} />
          </>
        )}

        {/* ── Quick Actions ── */}
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <QuickActionCard
            href="/admin/users"
            icon={UserCog}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-100 dark:bg-blue-950/50"
            hoverBorderColor="hover:border-blue-300 dark:hover:border-blue-700"
            title="Manage Users"
            description="View and manage all users, suspend or activate accounts"
            buttonText="View Users"
          />
          <QuickActionCard
            href="/admin/orders"
            icon={Package}
            iconColor="text-emerald-500"
            iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
            hoverBorderColor="hover:border-emerald-300 dark:hover:border-emerald-700"
            title="View Orders"
            description="Monitor all orders across the platform"
            buttonText="View Orders"
          />
          <QuickActionCard
            href="/admin/categories"
            icon={List}
            iconColor="text-violet-500"
            iconBgColor="bg-violet-100 dark:bg-violet-950/50"
            hoverBorderColor="hover:border-violet-300 dark:hover:border-violet-700"
            title="Manage Categories"
            description="Add, edit, or remove meal categories"
            buttonText="View Categories"
          />
          <QuickActionCard
            href="/admin/providers"
            icon={Store}
            iconColor="text-amber-500"
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            hoverBorderColor="hover:border-amber-300 dark:hover:border-amber-700"
            title="Manage Providers"
            description={`Review provider applications — ${stats?.providers?.pending || 0} pending`}
            buttonText="View Providers"
          />
        </div>
      </div>
    </div>
  );
}
