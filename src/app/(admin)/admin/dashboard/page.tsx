"use client";

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

import { QuickActionCard } from "@/components/admin/QuickActionCard";
import { StatCard } from "@/components/admin/StatCard";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

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
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Track whether we've already fetched so tab-switch doesn't re-fetch
  const hasFetched = useRef(false);

  // Protected route
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }

    if (!isPending && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== "ADMIN") {
        router.push("/");
      }
    }
  }, [session, isPending, router]);

  // Fetch stats — only once per mount, not every time session object re-renders
  useEffect(() => {
    if (!session?.user) return;
    // Already fetched — don't re-fetch on tab switch
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
  }, [session?.user?.id]); // ✅ Depend on user ID (stable string), not the whole session object

  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
        <div className="container mx-auto px-4 py-8 " suppressHydrationWarning>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Admin Dashboard
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                Welcome back, {user.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-950/50"
            label="Total Users"
            value={stats?.totalUsers || 0}
            subtext={`${stats?.totalCustomers || 0} customers • ${stats?.totalProviders || 0} providers`}
            isLoading={isLoading}
          />

          <StatCard
            icon={ShoppingBag}
            iconColor="text-green-600 dark:text-green-400"
            iconBgColor="bg-green-100 dark:bg-green-950/50"
            label="Total Orders"
            value={stats?.totalOrders || 0}
            isLoading={isLoading}
          />

          <StatCard
            icon={List}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBgColor="bg-purple-100 dark:bg-purple-950/50"
            label="Total Categories"
            value={stats?.totalCategories || 0}
            isLoading={isLoading}
          />
          <StatCard
            icon={Store}
            iconColor="text-yellow-600 dark:text-yellow-400"
            iconBgColor="bg-yellow-100 dark:bg-yellow-950/50"
            label="Pending Providers"
            value={stats?.providers?.pending || 0}
            subtext={`${stats?.providers?.approved || 0} approved • ${stats?.providers?.rejected || 0} rejected`}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            iconColor="text-green-500"
            iconBgColor="bg-green-100 dark:bg-green-950/50"
            hoverBorderColor="hover:border-green-300 dark:hover:border-green-700"
            title="View Orders"
            description="Monitor all orders across the platform"
            buttonText="View Orders"
          />

          <QuickActionCard
            href="/admin/categories"
            icon={List}
            iconColor="text-purple-500"
            iconBgColor="bg-purple-100 dark:bg-purple-950/50"
            hoverBorderColor="hover:border-purple-300 dark:hover:border-purple-700"
            title="Manage Categories"
            description="Add, edit, or remove meal categories"
            buttonText="View Categories"
          />
          <QuickActionCard
            href="/admin/providers"
            icon={Store}
            iconColor="text-yellow-500"
            iconBgColor="bg-yellow-100 dark:bg-yellow-950/50"
            hoverBorderColor="hover:border-yellow-300 dark:hover:border-yellow-700"
            title="Manage Providers"
            description={`Review provider applications — ${stats?.providers?.pending || 0} pending approval`}
            buttonText="View Providers"
          />
        </div>
      </div>
    </div>
  );
}
