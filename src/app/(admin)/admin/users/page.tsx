"use client";

import { Search, Users as UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
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

  // Fetch users — only once per mount
  useEffect(() => {
    if (!session?.user) return;
    if (hasFetched.current) return;

    const fetchUsers = async () => {
      try {
        hasFetched.current = true;
        setIsLoading(true);
        const data = await api.get("/users");
        setUsers(data.data || data);
        setFilteredUsers(data.data || data);
      } catch (error) {
        // console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [session?.user?.id]); // ✅ Stable string, not the whole session object

  // Filter and search
  useEffect(() => {
    let result = users;

    // Filter by role
    if (roleFilter !== "ALL") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Search by name or email
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      );
    }

    setFilteredUsers(result);
  }, [users, roleFilter, searchQuery]);

  // Toggle user status
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const toastId = toast.loading(
      `${newStatus ? "Activating" : "Suspending"} user...`,
    );

    try {
      await api.patch(`/users/${userId}/status`, {
        isActive: newStatus,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isActive: newStatus } : user,
        ),
      );

      toast.success(
        `User ${newStatus ? "activated" : "suspended"} successfully`,
        { id: toastId },
      );
    } catch (error: unknown) {
      // const message =
      //   error instanceof Error ? error.message : "Failed to update user status";
      // toast.error(message, { id: toastId });
      handleApiError(error, toastId);
    }
  };

  if (isPending) {
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

  if (!session?.user) return null;

  const roleCounts = {
    ALL: users.length,
    CUSTOMER: users.filter((u) => u.role === "CUSTOMER").length,
    PROVIDER: users.filter((u) => u.role === "PROVIDER").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            User Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
            View and manage all users
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => setRoleFilter(role)}
                className={`rounded-full whitespace-nowrap ${
                  roleFilter === role
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-0"
                    : ""
                }`}
              >
                {role === "ALL" ? "All Users" : `${role.toLowerCase()}s`} (
                {roleCounts[role]})
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
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="w-12 h-12 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              No users found
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {searchQuery
                ? "Try adjusting your search"
                : "No users match this filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
