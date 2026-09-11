"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LuSearch,
  LuMenu,
  LuX,
  LuTriangleAlert,
  LuHeartHandshake,
  LuShield,
  LuShieldAlert,
  LuLogIn,
  LuUserPlus,
  LuLogOut,
  LuUser,
  LuLayoutDashboard,
} from "react-icons/lu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  function handleTrack(e) {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/track/${trackingCode.trim()}`);
      setTrackingCode("");
      setMobileOpen(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/");
    setMobileOpen(false);
  }

  const navLinks = [
    { href: "/report/missing", label: "Report Missing", icon: LuTriangleAlert },
    { href: "/report/rescued", label: "Report Rescued", icon: LuHeartHandshake },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20 transition-shadow group-hover:shadow-red-500/40">
            <LuShield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Res<span className="text-red-500">Q</span>-Link
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-2.5 md:flex">
          {/* Quick track search */}
          <form onSubmit={handleTrack} className="relative">
            <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Enter tracking code..."
              className="h-9 w-52 pl-9 text-sm"
            />
          </form>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: isActive ? "default" : "outline", size: "sm" }),
                  "h-9 inline-flex items-center gap-1.5"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Admin console link (shown only to ADMIN) */}
          {isAdmin && (
            <Link
              href="/dashboard/triage"
              className={cn(
                buttonVariants({
                  variant: pathname?.startsWith("/dashboard") ? "default" : "outline",
                  size: "sm",
                }),
                "h-9 inline-flex items-center gap-1.5 border-red-500/40 text-red-500 hover:bg-red-500/10 hover:text-red-600 font-medium"
              )}
            >
              <LuShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
              <span>Admin Console</span>
            </Link>
          )}

          {/* Citizen Dashboard link (shown to authenticated non-admins) */}
          {isAuthenticated && !isAdmin && (
            <Link
              href="/citizen/dashboard"
              className={cn(
                buttonVariants({
                  variant: pathname === "/citizen/dashboard" ? "default" : "outline",
                  size: "sm",
                }),
                "h-9 inline-flex items-center gap-1.5"
              )}
            >
              <LuLayoutDashboard className="h-4 w-4 shrink-0" />
              <span>My Reports</span>
            </Link>
          )}

          {/* Auth section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-xs">
                <LuUser className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="max-w-[120px] truncate font-medium text-foreground">
                  {user?.full_name?.split(" ")[0] || "User"}
                </span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase ${
                    isAdmin
                      ? "bg-red-500/20 text-red-600 dark:text-red-400 font-mono"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {isAdmin ? "Admin" : "Citizen"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                title="Sign Out"
                onClick={handleLogout}
              >
                <LuLogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-9 inline-flex items-center gap-1.5"
                )}
              >
                <LuLogIn className="h-4 w-4 shrink-0" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "h-9 inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-sm hover:from-red-500 hover:to-orange-500"
                )}
              >
                <LuUserPlus className="h-4 w-4 shrink-0" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 pb-4 pt-3 md:hidden space-y-3">
          <form onSubmit={handleTrack} className="relative">
            <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Enter tracking code..."
              className="pl-9"
            />
          </form>

          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({ variant: isActive ? "default" : "outline" }),
                    "justify-start h-10 inline-flex items-center gap-2"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/dashboard/triage"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start h-10 border-red-500/30 text-red-500 inline-flex items-center gap-2 font-medium"
                )}
              >
                <LuShieldAlert className="h-4 w-4 shrink-0" />
                <span>Admin Console</span>
              </Link>
            )}

            {isAuthenticated && !isAdmin && (
              <Link
                href="/citizen/dashboard"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: pathname === "/citizen/dashboard" ? "default" : "outline" }),
                  "justify-start h-10 inline-flex items-center gap-2 font-medium"
                )}
              >
                <LuLayoutDashboard className="h-4 w-4 shrink-0" />
                <span>My Reports</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="mt-2 pt-3 border-t border-border/50 flex flex-col gap-2">
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-medium text-foreground">{user?.full_name}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      isAdmin ? "bg-red-500/20 text-red-500" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="justify-start h-10 text-destructive border-destructive/20 hover:bg-destructive/10 inline-flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LuLogOut className="h-4 w-4 shrink-0" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="mt-2 pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-10 inline-flex items-center justify-center gap-1.5"
                  )}
                >
                  <LuLogIn className="h-4 w-4 shrink-0" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({}),
                    "h-10 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white"
                  )}
                >
                  <LuUserPlus className="h-4 w-4 shrink-0" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
