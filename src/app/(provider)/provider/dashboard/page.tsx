"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  AlertCircle,
  ChefHat,
  Clock,
  Package,
  Plus,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProviderStatus = "PENDING" | "APPROVED" | "REJECTED";

type ProviderProfile = {
  id: string;
  businessName: string;
  status: ProviderStatus;
  rejectionReason?: string | null;
};

export default function ProviderDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    if (!isPending && session?.user) {
      const role = (session.user as { role?: string }).role;
      if (role !== "PROVIDER") router.push("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session?.user) return;

    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const data = await api.get("/provider/profile");
        setProfile(data.data || data);
      } catch {
        // Profile might not exist yet
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  if (isPending || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Welcome back, {user.name}!
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                {isApproved
                  ? "Manage your menu and orders from here"
                  : "Your provider dashboard"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ── Approval Status Banner ── */}
          {isPending_ && (
            <div className="mb-8 p-5 rounded-2xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Account Pending Approval
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Your provider account is under review. An admin will approve
                  your account shortly. You will be able to add meals and
                  receive orders once approved.
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="mb-8 p-5 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                  Account Application Rejected
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                  Your provider application was not approved.
                </p>
                {profile?.rejectionReason && (
                  <div className="bg-red-100 dark:bg-red-900/40 rounded-xl px-4 py-3">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                      Reason
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {profile.rejectionReason}
                    </p>
                  </div>
                )}
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  Please contact support if you believe this is a mistake.
                </p>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="mb-8 p-4 rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                ✓ Your account is approved — you can add meals and receive
                orders
              </p>
            </div>
          )}

          {/* Quick Actions Grid — disabled when not approved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add New Meal */}
            <Card
              className={`p-8 border border-zinc-200 dark:border-zinc-800 transition-all ${
                isApproved
                  ? "hover:border-orange-300 dark:hover:border-orange-700 cursor-pointer group"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isApproved ? (
                <Link href="/provider/menu" className="block">
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    Add New Meal
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Add a new meal to your menu and start receiving orders
                  </p>
                  <Button className="w-full rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white">
                    Go to Menu
                  </Button>
                </Link>
              ) : (
                <div>
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center mb-6">
                    <Plus className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    Add New Meal
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Available after account approval
                  </p>
                  <Button disabled className="w-full rounded-full">
                    Awaiting Approval
                  </Button>
                </div>
              )}
            </Card>

            {/* View Orders */}
            <Card
              className={`p-8 border border-zinc-200 dark:border-zinc-800 transition-all ${
                isApproved
                  ? "hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer group"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isApproved ? (
                <Link href="/provider/orders" className="block">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    View Orders
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Check incoming orders and update their status
                  </p>
                  <Button variant="outline" className="w-full rounded-full">
                    View All Orders
                  </Button>
                </Link>
              ) : (
                <div>
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center mb-6">
                    <ShoppingBag className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    View Orders
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Available after account approval
                  </p>
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full"
                  >
                    Awaiting Approval
                  </Button>
                </div>
              )}
            </Card>

            {/* Manage Menu */}
            <Card
              className={`p-8 border border-zinc-200 dark:border-zinc-800 transition-all ${
                isApproved
                  ? "hover:border-green-300 dark:hover:border-green-700 cursor-pointer group"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isApproved ? (
                <Link href="/provider/menu" className="block">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Package className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    Manage Menu
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Edit or remove existing meals from your menu
                  </p>
                  <Button variant="outline" className="w-full rounded-full">
                    Manage Menu
                  </Button>
                </Link>
              ) : (
                <div>
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center mb-6">
                    <Package className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    Manage Menu
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Available after account approval
                  </p>
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full"
                  >
                    Awaiting Approval
                  </Button>
                </div>
              )}
            </Card>

            {/* Profile — always accessible */}
            <Card className="p-8 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group">
              <Link href="/profile" className="block">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ChefHat className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  My Profile
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  Update your business information and contact details
                </p>
                <Button variant="outline" className="w-full rounded-full">
                  Edit Profile
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
