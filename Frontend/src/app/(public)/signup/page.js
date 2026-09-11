"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  LuShield,
  LuUser,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuCircleAlert,
  LuCircleCheck,
  LuArrowRight,
} from "react-icons/lu";

export default function SignupPage() {
  const router = useRouter();
  const { signup, user, isAuthenticated, isAdmin, logout, isLoading: isAuthLoading } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!formData.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

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
      setError("Please enter a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await signup({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/citizen/dashboard");
        }, 1200);
      } else {
        setError(res.message || "Failed to create account. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during signup.");
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
                You already have an active session as{" "}
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
                    <span>Go to Admin Console</span>
                    <LuArrowRight className="h-4 w-4 shrink-0" />
                  </Button>
                ) : (
                  <Button
                    className="w-full h-10 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md hover:from-red-500 hover:to-orange-500"
                    onClick={() => router.push("/citizen/dashboard")}
                  >
                    <span>Go to My Incident Dashboard</span>
                    <LuArrowRight className="h-4 w-4 shrink-0" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full h-10 inline-flex items-center justify-center gap-2 border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={logout}
                >
                  <span>Sign Out to Register a New Account</span>
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
            Create an Account
          </h2>
          <p className="text-sm text-muted-foreground">
            Join ResQ-Link to file emergency reports, track loved ones, and access crisis services.
          </p>
        </div>

        {/* Signup Card */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Citizen Registration</CardTitle>
            <CardDescription className="text-xs">
              All citizen accounts are granted public report submission and status tracking rights.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <LuCircleAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-xs text-green-600">
                <LuCircleCheck className="h-4 w-4 shrink-0" />
                <span>Account created successfully! Redirecting you now...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <LuUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <LuMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
                <div className="relative">
                  <LuLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Minimum 6 characters"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-xs font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <LuLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="pl-9 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-10 inline-flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-md shadow-red-500/20"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <LuLoader className="h-4 w-4 shrink-0 animate-spin" />
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>Complete Registration</span>
                    <LuArrowRight className="h-4 w-4 shrink-0" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
            <div>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
