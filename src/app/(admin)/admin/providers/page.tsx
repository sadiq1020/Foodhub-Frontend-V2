"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";
import { CheckCircle, Store, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Provider = {
  id: string;
  businessName: string;
  address: string;
  description?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    createdAt: string;
  };
  _count: { meals: number };
};

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_STYLES = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400",
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

export default function AdminProvidersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const hasFetched = useRef(false);

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [providerToReject, setProviderToReject] = useState<Provider | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    if (!isPending && session?.user) {
      const role = (session.user as { role?: string }).role;
      if (role !== "ADMIN") router.push("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session?.user) return;
    if (hasFetched.current) return;

    const fetchProviders = async () => {
      try {
        hasFetched.current = true;
        setIsLoading(true);
        const data = await api.get("/admin/providers");
        setProviders(data.data || []);
        setFiltered(data.data || []);
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [session?.user?.id]);

  // Filter + search
  useEffect(() => {
    let result = providers;
    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.user.name.toLowerCase().includes(q) ||
          p.user.email.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [providers, statusFilter, search]);

  const handleApprove = async (provider: Provider) => {
    const toastId = toast.loading(`Approving ${provider.businessName}...`);
    setIsActioning(true);
    try {
      await api.patch(`/admin/providers/${provider.id}/approve`, {});
      setProviders((prev) =>
        prev.map((p) =>
          p.id === provider.id
            ? { ...p, status: "APPROVED", rejectionReason: null }
            : p,
        ),
      );
      toast.success(`${provider.businessName} approved`, { id: toastId });
    } catch (error) {
      handleApiError(error, toastId);
    } finally {
      setIsActioning(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!providerToReject) return;
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error("Please enter a reason (at least 5 characters)");
      return;
    }

    const toastId = toast.loading(
      `Rejecting ${providerToReject.businessName}...`,
    );
    setIsActioning(true);
    try {
      await api.patch(`/admin/providers/${providerToReject.id}/reject`, {
        reason: rejectReason.trim(),
      });
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerToReject.id
            ? { ...p, status: "REJECTED", rejectionReason: rejectReason.trim() }
            : p,
        ),
      );
      toast.success(`${providerToReject.businessName} rejected`, {
        id: toastId,
      });
      setRejectDialogOpen(false);
      setProviderToReject(null);
      setRejectReason("");
    } catch (error) {
      handleApiError(error, toastId);
    } finally {
      setIsActioning(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  const counts = {
    ALL: providers.length,
    PENDING: providers.filter((p) => p.status === "PENDING").length,
    APPROVED: providers.filter((p) => p.status === "APPROVED").length,
    REJECTED: providers.filter((p) => p.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Provider Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
            Review and approve provider applications
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Input
            placeholder="Search by business name, owner name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-4"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as StatusFilter[]).map(
            (status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-0"
                    : ""
                }`}
              >
                {status === "ALL"
                  ? "All"
                  : status.charAt(0) + status.slice(1).toLowerCase()}{" "}
                ({counts[status]})
              </Button>
            ),
          )}
        </div>

        {/* Providers list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              No providers found
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {search
                ? "Try adjusting your search"
                : "No providers match this filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((provider) => (
              <Card
                key={provider.id}
                className="p-5 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Provider info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                            {provider.businessName}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              STATUS_STYLES[provider.status]
                            }`}
                          >
                            {provider.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          📍 {provider.address}
                        </p>
                      </div>
                    </div>

                    <div className="ml-13 pl-1 space-y-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      <p>
                        <span className="font-medium">Owner:</span>{" "}
                        {provider.user.name} — {provider.user.email}
                      </p>
                      <p>
                        <span className="font-medium">Meals:</span>{" "}
                        {provider._count.meals}
                      </p>
                      <p>
                        <span className="font-medium">Registered:</span>{" "}
                        {new Date(provider.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </p>
                      {provider.rejectionReason && (
                        <p className="text-red-500">
                          <span className="font-medium">Rejection reason:</span>{" "}
                          {provider.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {provider.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(provider)}
                        disabled={isActioning}
                        className="rounded-full bg-green-500 hover:bg-green-600 text-white border-0 gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                    )}
                    {provider.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setProviderToReject(provider);
                          setRejectReason("");
                          setRejectDialogOpen(true);
                        }}
                        disabled={isActioning}
                        className="rounded-full gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    )}
                    {provider.status === "APPROVED" && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Reject {providerToReject?.businessName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejection. The provider will see this
              message on their dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Input
            placeholder="e.g., Insufficient business information provided"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="rounded-xl"
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              disabled={isActioning || rejectReason.trim().length < 5}
              className="bg-red-500 hover:bg-red-600"
            >
              Reject Provider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
