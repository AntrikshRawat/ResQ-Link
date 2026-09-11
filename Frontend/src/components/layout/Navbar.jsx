"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuSearch, LuMenu, LuX, LuTriangleAlert, LuHeartHandshake, LuShield } from "react-icons/lu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  function handleTrack(e) {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/track/${trackingCode.trim()}`);
      setTrackingCode("");
      setMobileOpen(false);
    }
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
        <div className="hidden items-center gap-3 md:flex">
          {/* Quick track search */}
          <form onSubmit={handleTrack} className="relative">
            <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Enter tracking code..."
              className="h-9 w-56 pl-9 text-sm"
            />
          </form>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="h-9"
                asChild
              >
                <Link href={link.href} className="inline-flex items-center gap-1.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              </Button>
            );
          })}
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
        <div className="border-t border-border/40 bg-background px-4 pb-4 pt-3 md:hidden">
          <form onSubmit={handleTrack} className="relative mb-3">
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
              return (
                <Button
                  key={link.href}
                  variant="outline"
                  className="justify-start h-10"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href={link.href} className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
