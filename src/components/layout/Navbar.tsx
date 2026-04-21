"use client";

import { Menu, ShoppingCart } from "lucide-react"; // ✅ Add ShoppingCart
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext"; // ✅ Add this
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import logo from "../../../public/images/logo.png";
import { ModeToggle } from "./ModeToggle";

// nav links
const navLinks = [
  { title: "Browse Meals", url: "/meals" },
  { title: "Providers", url: "/provider-profile" },
];

const Navbar = ({ className }: { className?: string }) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { items, setUserId, clearCart } = useCart();

  const user = session?.user;
  const role = (user as { role?: string })?.role ?? "";

  // ✅ Sync cart userId whenever session changes (login/logout/user switch)
  useEffect(() => {
    if (!isPending) {
      setUserId(user?.id ?? null);
    }
  }, [user?.id, isPending, setUserId]);

  // ✅ Calculate total items in cart — only show for customers
  const cartItemsCount =
    role === "CUSTOMER"
      ? items.reduce((total, item) => total + item.quantity, 0)
      : 0;

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle logout — clear cart and redirect
  const handleLogout = async () => {
    clearCart();
    setUserId(null);
    await authClient.signOut();
    router.push("/login");
  };

  // Dropdown menu items based on role
  const renderDropdownItems = () => {
    if (role === "ADMIN") {
      return (
        <>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">Admin Panel</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-500">
            Logout
          </DropdownMenuItem>
        </>
      );
    }

    if (role === "PROVIDER") {
      return (
        <>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/provider/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-500">
            Logout
          </DropdownMenuItem>
        </>
      );
    }

    // Default: CUSTOMER
    return (
      <>
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/favourites">My Favourites</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders">My Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          Logout
        </DropdownMenuItem>
      </>
    );
  };

  // Auth section - shows skeleton, user avatar, or login/register buttons
  const renderAuthSection = () => {
    if (isPending) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      );
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(user.name || "U")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            {renderDropdownItems()}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <>
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Sign up</Link>
        </Button>
      </>
    );
  };

  return (
    <section className={cn("py-4", className)}>
      <div className="container mx-auto py-4">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logo}
                alt="FoodHub"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-xl font-bold">
                <span className="text-orange-500">Food</span>Hub
              </span>
            </Link>

            {/* Nav Links */}
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink
                      asChild
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
                    >
                      <Link href={item.url}>{item.title}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: Cart + Mode Toggle + Auth */}
          <div className="flex items-center gap-2">
            {/* Cart Button — only for customers */}
            {role === "CUSTOMER" && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="relative"
              >
                <Link href="/cart">
                  <ShoppingCart className="w-4 h-4" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </Button>
            )}

            <ModeToggle />
            {renderAuthSection()}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logo}
                alt="FoodHub"
                width={30}
                height={30}
                className="h-10 w-10"
              />
              <span className="text-xl font-bold">
                <span className="text-orange-500">Food</span>Hub
              </span>
            </Link>

            {/* Right side: Cart + Mode toggle + hamburger */}
            <div className="flex items-center gap-2">
              {/* Mobile Cart Button — only for customers */}
              {role === "CUSTOMER" && (
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="relative"
                >
                  <Link href="/cart">
                    <ShoppingCart className="w-4 h-4" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-semibent">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </Button>
              )}

              <ModeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <Link href="/" className="flex items-center gap-2">
                        <Image
                          src={logo}
                          alt="FoodHub"
                          width={24}
                          height={24}
                          className="h-8 w-8"
                        />
                        <span className="text-lg font-semibold">
                          <span className="text-orange-500">Food</span>Hub
                        </span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-6 p-4">
                    {/* Mobile Nav Links */}
                    <div className="flex flex-col gap-4">
                      {navLinks.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          className="text-md font-semibold"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>

                    {/* Mobile Auth */}
                    <div className="flex flex-col gap-3">
                      {isPending ? (
                        <Skeleton className="h-9 w-full" />
                      ) : user ? (
                        <>
                          {/* User info */}
                          <div className="flex items-center gap-2 border rounded-lg p-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getInitials(user.name || "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {role}
                              </p>
                            </div>
                          </div>

                          {/* Role-based mobile links */}
                          {role === "ADMIN" && (
                            <>
                              <Button asChild variant="outline">
                                <Link href="/profile">Profile</Link>
                              </Button>
                              <Button asChild variant="outline">
                                <Link href="/admin/dashboard">Admin Panel</Link>
                              </Button>
                            </>
                          )}
                          {role === "PROVIDER" && (
                            <>
                              <Button asChild variant="outline">
                                <Link href="/profile">Profile</Link>
                              </Button>
                              <Button asChild variant="outline">
                                <Link href="/provider/dashboard">
                                  Dashboard
                                </Link>
                              </Button>
                            </>
                          )}
                          {role === "CUSTOMER" && (
                            <>
                              <Button asChild variant="outline">
                                <Link href="/profile">Profile</Link>
                              </Button>
                              <Button asChild variant="outline">
                                <Link href="/favourites">My Favourites</Link>{" "}
                                {/* ← add this */}
                              </Button>
                              <Button asChild variant="outline">
                                <Link href="/orders">My Orders</Link>
                              </Button>
                            </>
                          )}

                          {/* Logout */}
                          <Button variant="destructive" onClick={handleLogout}>
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild variant="outline">
                            <Link href="/login">Login</Link>
                          </Button>
                          <Button asChild>
                            <Link href="/register">Sign up</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Navbar };
