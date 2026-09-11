"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  LuShield,
  LuShieldAlert,
  LuUser,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuCircleAlert,
  LuCircleCheck,
  LuArrowRight,
  LuLogOut,
  LuLayoutDashboard,
} from "react-icons/lu";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "ADMIN" : "USER";
  const redirectUrl = searchParams.get("redirect") || "";

  const { login, loginAsAdmin, user, isAuthenticated, isAdmin, logout, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState(initialRole); // "USER" | "ADMIN"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Sync tab if URL param changes
  useEffect(() => {
    if (searchParams.get("role") === "admin") {
      setActiveTab("ADMIN");
    }
  }, [searchParams]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  // Helper to fill demo admin credentials for convenience
  function handleFillAdminDemo() {
    setFormData({
      email: "admin@resqlink.org",
      password: "Admin@123456",
    });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      let res;
      if (activeTab === "ADMIN") {
        res = await loginAsAdmin({
          email: formData.email.trim(),
          password: formData.password,
        });
      } else {
        res = await login({
          email: formData.email.trim(),
          password: formData.password,
        });
      }

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (activeTab === "ADMIN" || res.data?.user?.role === "ADMIN") {
            router.push(redirectUrl || "/dashboard/triage");
          } else {
            router.push(redirectUrl || "/citizen/dashboard");
          }
        }, 1200);
      } else {
        setError(res.message || "Invalid credentials. Please check your details and try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
  }

  // If already authenticated and not loading, give quick option to continue or switch
  if (!isAuthLoading && isAuthenticated && user && !success) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xl text-center">
            <CardHeader className="space-y-3 pb-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                <LuCircleCheck className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl">Already Signed In</CardTitle>
              <CardDescription className="text-sm">
                You are currently signed in as{" "}
                <span className="font-semibold text-foreground">{user.full_name}</span> (
                <span className="font-mono text-xs">{user.email}</span>)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">
                Role: <span className="uppercase text-primary font-bold">{user.role}</span>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                {isAdmin ? (
                  <Button
                    className="w-full h-10 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md hover:from-red-500 hover:to-orange-500"
                    onClick={() => router.push("/dashboard/triage")}
                  >
                    <LuLayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Go to Admin Staff Console</span>
                  </Button>
                ) : (
                  <Button
                    className="w-full h-10 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md hover:from-red-500 hover:to-orange-500"
                    onClick={() => router.push("/citizen/dashboard")}
                  >
                    <LuLayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Go to My Incident Dashboard</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full h-10 inline-flex items-center justify-center gap-2 border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={logout}
                >
                  <LuLogOut className="h-4 w-4 shrink-0" />
                  <span>Sign Out / Switch Account</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
            <LuShield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome to ResQ-Link
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to coordinate rescue reports or administer emergency triage.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 rounded-xl bg-muted/70 p-1 border border-border/50 text-sm font-medium">
          <button
            type="button"
            onClick={() => handleTabChange("USER")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all ${
              activeTab === "USER"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LuUser className="h-4 w-4 shrink-0" />
            <span>Citizen Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("ADMIN")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg py-2.5 transition-all ${
              activeTab === "ADMIN"
                ? "bg-red-600 text-white shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LuShieldAlert className="h-4 w-4 shrink-0" />
            <span>Admin Staff</span>
          </button>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {activeTab === "ADMIN" ? "Staff Authentication" : "Citizen Account"}
              </CardTitle>
              {activeTab === "ADMIN" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/20">
                  <LuLock className="h-3 w-3" />
                  Restricted
                </span>
              )}
            </div>
            <CardDescription className="text-xs">
              {activeTab === "ADMIN"
                ? "Enter your verified administrative credentials to access triage controls."
                : "Enter your registered email and password to track reports and updates."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <LuCircleAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-xs text-green-600">
                <LuCircleCheck className="h-4 w-4 shrink-0" />
                <span>
                  {activeTab === "ADMIN"
                    ? "Staff authorization verified! Redirecting to Triage Console..."
                    : "Signed in successfully! Redirecting..."}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="login_email" className="text-xs font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <LuMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login_email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={activeTab === "ADMIN" ? "admin@resqlink.org" : "name@example.com"}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login_password" className="text-xs font-medium">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <LuLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login_password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="pl-9 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || success}
                className={`w-full h-10 inline-flex items-center justify-center gap-2 font-medium shadow-md text-white ${
                  activeTab === "ADMIN"
                    ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-600/25"
                    : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/20"
                }`}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <LuLoader className="h-4 w-4 shrink-0 animate-spin" />
                    <span>
                      {activeTab === "ADMIN" ? "Verifying Staff Clearance..." : "Signing In..."}
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>{activeTab === "ADMIN" ? "Sign In to Admin Console" : "Sign In"}</span>
                    <LuArrowRight className="h-4 w-4 shrink-0" />
                  </span>
                )}
              </Button>
            </form>

            {/* Admin Demo Helper */}
            {activeTab === "ADMIN" && (
              <div className="mt-4 rounded-lg border border-border/50 bg-muted/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Default Admin Credentials</span>
                  <button
                    type="button"
                    onClick={handleFillAdminDemo}
                    className="text-red-500 hover:underline font-medium text-[11px]"
                  >
                    Auto Fill
                  </button>
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground/90 space-y-0.5">
                  <div>Email: admin@resqlink.org</div>
                  <div>Password: Admin@123456</div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
            {activeTab === "USER" ? (
              <div>
                Don&apos;t have a citizen account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Create one now
                </Link>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Staff accounts require clearance from crisis dispatch.{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("USER")}
                  className="font-semibold text-primary hover:underline"
                >
                  Citizen login instead
                </button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <LuLoader className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
