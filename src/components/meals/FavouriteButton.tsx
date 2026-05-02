"use client";

import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FavouriteButtonProps {
  mealId: string;
  size?: "sm" | "md";
}

export function FavouriteButton({ mealId, size = "md" }: FavouriteButtonProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isFavourited, setIsFavourited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only customers can use favourites — admins/providers get 403 from backend
  const isCustomer = (session?.user as { role?: string })?.role === "CUSTOMER";

  useEffect(() => {
    // Skip if: session still loading, no user logged in, or not a customer role
    if (isPending || !session?.user || !isCustomer) return;

    const check = async () => {
      try {
        const data = await api.get(`/favourites/${mealId}/check`);
        setIsFavourited(data.data?.isFavourited ?? false);
      } catch {
        // ignore silently
      }
    };

    check();
  }, [mealId, session?.user, isPending, isCustomer]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session?.user || !isCustomer) {
      toast.error("Please login as a customer to save meals", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFavourited) {
        await api.delete(`/favourites/${mealId}`);
        setIsFavourited(false);
        toast.success("Removed from favourites");
      } else {
        await api.post(`/favourites/${mealId}`, {});
        setIsFavourited(true);
        toast.success("Added to favourites!");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const buttonSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`${buttonSize} rounded-full flex items-center justify-center transition-all duration-200
        ${
          isFavourited
            ? "bg-emerald-500 text-zinc-950 shadow-md"
            : "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-zinc-500 dark:text-zinc-400 hover:bg-emerald-500/10 dark:hover:bg-zinc-700 hover:text-emerald-500"
        }
        ${isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
      title={isFavourited ? "Remove from favourites" : "Add to favourites"}
    >
      <Bookmark className={`${iconSize} ${isFavourited ? "fill-white" : ""}`} />
    </button>
  );
}
