"use client";

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
import { useCart } from "@/context/CartContext";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import logo from "../../../public/images/logo.png";
import { ModeToggle } from "./ModeToggle";

// ─── Nav links ───────────────────────────────────────────────────────────────

const PUBLIC_NAV_LINKS = [
  { title: "Browse Meals", url: "/meals" },
  { title: "Providers", url: "/provider-profile" },
  { title: "About", url: "/about" },
  { title: "Blog", url: "/blog" },
];

// ─── Component ───────────────────────────────────────────────────────────────

const Navbar = ({ className }: { className?: string }) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { items, setUserId, clearCart } = useCart();

  const user = session?.user;
  const role = (user as { role?: string })?.role ?? "";

  // Scroll-aware state
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = lastScrollY.current;
    // Hide navbar when scrolling DOWN past 120px
    if (latest > 120 && latest > prev + 4) {
      setHidden(true);
    } else if (latest < prev - 4) {
      setHidden(false);
    }
    // Apply "scrolled" style after 20px
    setScrolled(latest > 20);
    lastScrollY.current = latest;
  });

  // Sync cart userId
  useEffect(() => {
    if (!isPending) {
      setUserId(user?.id ?? null);
    }
  }, [user?.id, isPending, setUserId]);

  const cartItemsCount =
    role === "CUSTOMER"
      ? items.reduce((total, item) => total + item.quantity, 0)
      : 0;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = async () => {
    clearCart();
    setUserId(null);
    await authClient.signOut();
    router.push("/login");
  };

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

  const renderAuthSection = () => {
    if (isPending) {
      return <Skeleton className="h-8 w-8 rounded-full" />;
    }
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-8 w-8 ring-2 ring-transparent hover:ring-emerald-400 transition-all duration-200">
              <AvatarFallback className="bg-emerald-500 text-white text-sm font-semibold">
                {getInitials(user.name || "U")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-2 border-b border-border mb-1">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            {renderDropdownItems()}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <>
        <Button asChild variant="ghost" size="sm" className="text-sm">
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm shadow-emerald-500/20 text-sm"
        >
          <Link href="/register">Sign up</Link>
        </Button>
      </>
    );
  };

  return (
    <motion.header
      animate={{
        y: hidden ? "-100%" : "0%",
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        // Sticky + full-width base
        "fixed top-0 left-0 right-0 z-50 w-full",
        // Border + transition
        "border-b transition-all duration-300",
        // Scrolled: frosted glass. Not scrolled: transparent
        scrolled
          ? "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800/80 shadow-sm shadow-black/5"
          : "bg-white dark:bg-zinc-900 border-transparent",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        {/* Desktop */}
        <nav className="hidden lg:flex items-center justify-between h-16">
          {/* Left: Logo + Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-emerald-400 transition-all duration-300">
                <Image src={logo} alt="FoodHub" fill className="object-cover" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-emerald-500">Food</span>
                <span className="text-zinc-900 dark:text-zinc-50">Hub</span>
              </span>
            </Link>

            <NavigationMenu>
              <NavigationMenuList className="gap-0.5">
                {PUBLIC_NAV_LINKS.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.url}
                        className="
                          inline-flex h-9 items-center justify-center
                          rounded-lg px-3 py-1.5 text-sm font-medium
                          text-zinc-600 dark:text-zinc-400
                          hover:text-zinc-900 dark:hover:text-zinc-50
                          hover:bg-zinc-100 dark:hover:bg-zinc-800
                          transition-all duration-200
                        "
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: Cart + Theme + Auth */}
          <div className="flex items-center gap-2">
            {role === "CUSTOMER" && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative w-9 h-9 rounded-lg"
              >
                <Link href="/cart">
                  <ShoppingCart className="w-4 h-4" />
                  {cartItemsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-4.5 min-h-4.5] bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1"
                    >
                      {cartItemsCount}
                    </motion.span>
                  )}
                </Link>
              </Button>
            )}
            <ModeToggle />
            {renderAuthSection()}
          </div>
        </nav>

        {/* Mobile */}
        <div className="flex lg:hidden items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700">
              <Image src={logo} alt="FoodHub" fill className="object-cover" />
            </div>
            <span className="text-base font-bold tracking-tight">
              <span className="text-emerald-500">Food</span>
              <span className="text-zinc-900 dark:text-zinc-50">Hub</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {role === "CUSTOMER" && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative w-9 h-9"
              >
                <Link href="/cart">
                  <ShoppingCart className="w-4 h-4" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700">
                        <Image
                          src={logo}
                          alt="FoodHub"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-base font-bold">
                        <span className="text-emerald-500">Food</span>Hub
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 mb-6">
                  {PUBLIC_NAV_LINKS.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      className="flex items-center px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-6">
                  {isPending ? (
                    <Skeleton className="h-10 w-full rounded-lg" />
                  ) : user ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl mb-2">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-emerald-500 text-white text-sm font-semibold">
                            {getInitials(user.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {role}
                          </p>
                        </div>
                      </div>

                      {role === "ADMIN" && (
                        <>
                          <Button
                            asChild
                            variant="outline"
                            className="justify-start"
                          >
                            <Link href="/profile">Profile</Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="justify-start"
                          >
                            <Link href="/admin/dashboard">Admin Panel</Link>
                          </Button>
                        </>
                      )}
                      {role === "PROVIDER" && (
                        <>
                          <Button
                            asChild
                            variant="outline"
                            className="justify-start"
                          >
                            <Link href="/profile">Profile</Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="justify-start"
                          >
                            <Link href="/provider/dashboard">Dashboard</Link>
                          </Button>
                        </>
                      )}
                      {role === "CUSTOMER" && (
                        <>
                          <Button
                            asChild
                            variant="outline"
                            className="justify-start"
                          >
                            <Link href="/profile">Profile</Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="justify-start"
                          >
                            <Link href="/favourites">My Favourites</Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="justify-start"
                          >
                            <Link href="/orders">My Orders</Link>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="destructive"
                        className="mt-1"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-emerald-500 hover:bg-emerald-400 text-white"
                      >
                        <Link href="/register">Sign up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export { Navbar };
