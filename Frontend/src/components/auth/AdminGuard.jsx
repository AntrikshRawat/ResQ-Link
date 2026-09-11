"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LuShieldAlert,
  LuShieldX,
  LuLoader,
  LuLock,
  LuLogIn,
  LuHouse,
  LuLogOut,
} from "react-icons/lu";

export default function AdminGuard({ children }) {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();

  // 1. Loading state while checking localStorage/token
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/25">
            <LuLock className="h-7 w-7 text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <LuLoader className="h-4 w-4 animate-spin text-red-500" />
            <span>Verifying Staff Security Clearance...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Not logged in at all
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
        <div className="w-full max-w-md space-y-4">
          <Card className="border-red-500/30 bg-card/90 shadow-2xl backdrop-blur-md">
            <CardHeader className="text-center space-y-3 pb-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 text-white shadow-xl shadow-red-600/30">
                <LuShieldAlert className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Staff Authentication Required
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                The Staff Triage Console and Person Records Registry are strictly restricted to authorized emergency coordinators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
                <p className="font-semibold">Security Clearance Level 1</p>
                <p className="mt-1 text-muted-foreground">
                  Please authenticate using an administrative staff account to continue.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-red-600 to-orange-600 font-medium text-white shadow-md hover:from-red-500 hover:to-orange-500"
                  asChild
                >
                  <Link href="/login?role=admin&redirect=/dashboard/triage">
                    <LuLogIn className="h-4 w-4" />
                    <span>Sign In with Admin Account</span>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href="/">
                    <LuHouse className="h-4 w-4" />
                    <span>Return to Public Site</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 3. Authenticated but role is NOT ADMIN (e.g. USER / citizen)
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
        <div className="w-full max-w-md space-y-4">
          <Card className="border-amber-500/40 bg-card/90 shadow-2xl backdrop-blur-md">
            <CardHeader className="text-center space-y-3 pb-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30">
                <LuShieldX className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                Access Restricted
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Your account is registered as a <strong className="text-foreground">Citizen</strong> (
                <span className="font-mono">{user?.email}</span>).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                <p className="font-semibold">403 Forbidden: Administrator Privileges Required</p>
                <p className="mt-1 text-muted-foreground">
                  Citizen accounts do not have permission to view emergency triage queues or edit identity records.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-red-600 to-orange-600 font-medium text-white shadow-md hover:from-red-500 hover:to-orange-500"
                  onClick={() => {
                    logout();
                    router.push("/login?role=admin&redirect=/dashboard/triage");
                  }}
                >
                  <LuLogOut className="h-4 w-4" />
                  <span>Switch to Admin Account</span>
                </Button>

                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href="/">
                    <LuHouse className="h-4 w-4" />
                    <span>Back to Citizen Home</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 4. Authenticated AND role is ADMIN
  return <>{children}</>;
}
