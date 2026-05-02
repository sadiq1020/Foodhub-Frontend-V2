"use client";

import { ProviderCharts } from "@/components/provider/ProviderCharts";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  AlertCircle,
  ChefHat,
  Clock,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  Star,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ProviderStatus = "PENDING" | "APPROVED" | "REJECTED";

type ProviderProfile = {
  id: string;
  businessName: string;
  status: ProviderStatus;
  rejectionReason?: string | null;
};

type ProviderStats = {
  totalMeals: number;
  availableMeals: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  avgRating: number | null;
  ordersByStatus: { name: string; value: number; fill: string }[];
  ordersLast7Days: { day: string; orders: number }[];
};

// ─── Mini stat card ───────────────────────────────────────────────────────────
function MiniStat({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {value}
      </div>
      {sub && (
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Action card ──────────────────────────────────────────────────────────────
function ActionCard({
  href,
  icon: Icon,
  title,
  desc,
  buttonText,
  iconColor,
  iconBg,
  borderHover,
  disabled,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  buttonText: string;
  iconColor: string;
  iconBg: string;
  borderHover: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm transition-all duration-200 h-full flex flex-col gap-4 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : `cursor-pointer ${borderHover} hover:-translate-y-0.5 hover:shadow-md group`
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center ${disabled ? "" : "group-hover:scale-110 transition-transform duration-200"}`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {desc}
        </p>
      </div>
      <div
        className={`text-xs font-semibold px-4 py-2 rounded-xl text-center transition-colors duration-200 ${
          disabled
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
            : "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-white"
        }`}
      >
        {disabled ? "Awaiting Approval" : buttonText}
      </div>
    </div>
  );

  return disabled ? <div>{inner}</div> : <Link href={href}>{inner}</Link>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(
    null,
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    if (!isPending && session?.user) {
      const role = (session.user as { role?: string }).role;
      if (role !== "PROVIDER") router.push("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session?.user || hasFetched.current) return;
    hasFetched.current = true;

    const fetchAll = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          api.get("/provider/profile").catch(() => null),
          api.get("/provider/stats").catch(() => null),
        ]);
        if (profileData) setProfile(profileData.data || profileData);
        if (statsData) setProviderStats(statsData.data || statsData);
      } finally {
        setIsLoadingProfile(false);
        setIsLoadingStats(false);
      }
    };

    fetchAll();
  }, [session?.user?.id]);

  if (isPending || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as { name: string; role?: string };
  const isApproved = profile?.status === "APPROVED";
  const isPending_ = profile?.status === "PENDING";
  const isRejected = profile?.status === "REJECTED";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {profile?.businessName || "Provider Dashboard"}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                Welcome back, {user.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ── Status banners ── */}
        {isPending_ && (
          <div className="mb-6 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                Account Pending Approval
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                An admin will review and approve your account shortly.
                You&apos;ll be able to add meals and receive orders once
                approved.
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="mb-6 p-4 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                Application Rejected
              </p>
              {profile?.rejectionReason && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 bg-red-100 dark:bg-red-900/40 rounded-lg px-3 py-2">
                  Reason: {profile.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}

        {isApproved && (
          <div className="mb-6 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              ✓ Your account is approved — you can add meals and receive orders
            </p>
          </div>
        )}

        {/* ── Stats cards (only for approved) ── */}
        {isApproved && !isLoadingStats && providerStats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MiniStat
                icon={UtensilsCrossed}
                label="Available Meals"
                value={providerStats.availableMeals}
                sub={`${providerStats.totalMeals} total`}
                color="text-emerald-600 dark:text-emerald-400"
                bg="bg-emerald-100 dark:bg-emerald-950/50"
              />
              <MiniStat
                icon={ShoppingBag}
                label="Total Orders"
                value={providerStats.totalOrders}
                color="text-blue-600 dark:text-blue-400"
                bg="bg-blue-100 dark:bg-blue-950/50"
              />
              <MiniStat
                icon={DollarSign}
                label="Total Revenue"
                value={`৳${providerStats.totalRevenue.toLocaleString()}`}
                sub="From delivered orders"
                color="text-amber-600 dark:text-amber-400"
                bg="bg-amber-100 dark:bg-amber-950/50"
              />
              <MiniStat
                icon={Star}
                label="Avg. Rating"
                value={providerStats.avgRating ?? "—"}
                sub={`${providerStats.totalReviews} reviews`}
                color="text-violet-600 dark:text-violet-400"
                bg="bg-violet-100 dark:bg-violet-950/50"
              />
            </div>

            {/* ── Charts ── */}
            <ProviderCharts
              ordersByStatus={providerStats.ordersByStatus}
              ordersLast7Days={providerStats.ordersLast7Days}
            />
          </>
        )}

        {/* ── Action cards ── */}
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <ActionCard
            href="/provider/menu"
            icon={Plus}
            title="Add New Meal"
            desc="Add a new dish to your menu and start receiving orders"
            buttonText="Go to Menu"
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-100 dark:bg-emerald-950/50"
            borderHover="hover:border-emerald-300 dark:hover:border-emerald-700"
            disabled={!isApproved}
          />
          <ActionCard
            href="/provider/orders"
            icon={ShoppingBag}
            title="View Orders"
            desc="Check incoming orders and update their delivery status"
            buttonText="View Orders"
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-100 dark:bg-blue-950/50"
            borderHover="hover:border-blue-300 dark:hover:border-blue-700"
            disabled={!isApproved}
          />
          <ActionCard
            href="/provider/menu"
            icon={Package}
            title="Manage Menu"
            desc="Edit or remove existing meals from your menu"
            buttonText="Manage Menu"
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-100 dark:bg-amber-950/50"
            borderHover="hover:border-amber-300 dark:hover:border-amber-700"
            disabled={!isApproved}
          />
          <ActionCard
            href="/profile"
            icon={ChefHat}
            title="My Profile"
            desc="Update your business information and contact details"
            buttonText="Edit Profile"
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-100 dark:bg-violet-950/50"
            borderHover="hover:border-violet-300 dark:hover:border-violet-700"
          />
        </div>
      </div>
    </div>
  );
}
