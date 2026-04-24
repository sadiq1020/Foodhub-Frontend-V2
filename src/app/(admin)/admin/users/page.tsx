"use client";

import { Search, Users as UsersIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { UserCard } from "@/components/admin/UserCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
};

type RoleFilter = "ALL" | "CUSTOMER" | "PROVIDER" | "ADMIN";

const LIMIT = 12;

function AdminUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Read state from URL
  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const roleFilter = (searchParams.get("role") || "ALL") as RoleFilter;

  // Local input state for debouncing
  const [searchInput, setSearchInput] = useState(search);

  // Auth guard
  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    if (!isPending && session?.user) {
      const role = (session.user as { role?: string }).role;
      if (role !== "ADMIN") router.push("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    setSearchInput(search);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setParam("search", searchInput, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const setParam = useCallback(
    (key: string, value: string, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (resetPage) params.delete("page");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  // Fetch from backend whenever URL params change
  useEffect(() => {
    if (!session?.user) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(LIMIT));
        if (search) params.set("search", search);
        if (roleFilter !== "ALL") params.set("role", roleFilter);

        const data = await api.get(`/users?${params.toString()}`);
        setUsers(data.data || []);
        setTotal(data.meta?.total || 0);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [session?.user, session?.user?.id, page, search, roleFilter]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const toastId = toast.loading(
      `${newStatus ? "Activating" : "Suspending"} user...`,
    );
    try {
      await api.patch(`/users/${userId}/status`, { isActive: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u)),
      );
      toast.success(
        `User ${newStatus ? "activated" : "suspended"} successfully`,
        {
          id: toastId,
        },
      );
    } catch (error: unknown) {
      handleApiError(error, toastId);
    }
  };

  if (isPending) return <LoadingSkeleton />;
  if (!session?.user) return null;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            User Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
            {total} total user{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["ALL", "CUSTOMER", "PROVIDER", "ADMIN"] as RoleFilter[]).map(
            (role) => (
              <Button
                key={role}
                variant={roleFilter === role ? "default" : "outline"}
                size="sm"
                onClick={() => setParam("role", role, true)}
                className={`rounded-full whitespace-nowrap ${
                  roleFilter === role
                    ? "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 border-0"
                    : ""
                }`}
              >
                {role === "ALL" ? "All Users" : `${role.toLowerCase()}s`}
              </Button>
            ),
          )}
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="w-12 h-12 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              No users found
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {search
                ? "Try adjusting your search"
                : "No users match this filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Page {page} of {totalPages} · {total} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setParam("page", String(page - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setParam("page", String(page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  );
}
