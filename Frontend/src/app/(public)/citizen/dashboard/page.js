"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserReports, BACKEND_URL } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LuUser,
  LuShield,
  LuHeartHandshake,
  LuTriangleAlert,
  LuSearch,
  LuMapPin,
  LuCalendar,
  LuClock,
  LuCircleCheck,
  LuCircleAlert,
  LuCopy,
  LuCheck,
  LuArrowRight,
  LuLoader,
  LuPlus,
  LuExternalLink,
  LuRefreshCw,
} from "react-icons/lu";

export default function CitizenDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("missing"); // "missing" | "rescued" | "all"
  const [copiedCode, setCopiedCode] = useState(null);

  async function fetchReports() {
    setLoading(true);
    setError("");
    try {
      const res = await getUserReports();
      if (res.success) {
        setReportsData(res.data);
      } else {
        setError(res.message || "Unable to fetch your reports.");
      }
    } catch (err) {
      setError(err.message || "Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        // Not logged in
        setLoading(false);
      } else {
        fetchReports();
      }
    }
  }, [isAuthLoading, isAuthenticated]);

  function handleCopy(code) {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  }

  // 1. Loading auth state
  if (isAuthLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LuLoader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading citizen portal...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: prompt user to sign in
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 text-red-500">
          <LuUser className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Citizen Sign In Required
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Please sign in with your registered account to view your filed missing person inquiries, track real-time updates, and monitor individuals you have reported as rescued.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login?redirect=/citizen/dashboard"
            className={cn(
              buttonVariants({}),
              "h-10 px-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md hover:from-red-500 hover:to-orange-500 font-medium"
            )}
          >
            <span>Sign In to Your Dashboard</span>
            <LuArrowRight className="h-4 w-4 shrink-0" />
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 px-4 inline-flex items-center justify-center gap-2 font-medium"
            )}
          >
            <span>Create Citizen Account</span>
          </Link>
        </div>
      </div>
    );
  }

  const stats = reportsData?.stats || {
    total: 0,
    missing_count: 0,
    rescued_count: 0,
    resolved_count: 0,
    pending_verification_count: 0,
  };

  const missingReports = reportsData?.missing_reports || [];
  const rescuedReports = reportsData?.rescued_reports || [];
  const allReports = reportsData?.all_reports || [];

  const currentList =
    activeTab === "missing"
      ? missingReports
      : activeTab === "rescued"
      ? rescuedReports
      : allReports;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Citizen Emergency Dashboard
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Incident Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tracking reports filed by <strong className="text-foreground">{user?.full_name}</strong> (
            <span className="font-mono text-xs">{user?.email}</span>)
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={loading}
            className="h-9 px-3 gap-1.5 inline-flex items-center"
            title="Refresh reports"
          >
            <LuRefreshCw className={`h-4 w-4 shrink-0 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Link
            href="/report/missing"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 px-3.5 bg-red-600 hover:bg-red-500 text-white shadow-sm inline-flex items-center gap-1.5 font-medium"
            )}
          >
            <LuTriangleAlert className="h-4 w-4 shrink-0" />
            <span>Report Missing</span>
          </Link>

          <Link
            href="/report/rescued"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 px-3.5 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700 inline-flex items-center gap-1.5 font-medium"
            )}
          >
            <LuHeartHandshake className="h-4 w-4 shrink-0" />
            <span>Report Rescued</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Missing Filed */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Missing Reported</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <LuTriangleAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {stats.missing_count}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Loved ones being searched</p>
          </CardContent>
        </Card>

        {/* Rescued Reported */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Rescued Reported</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <LuHeartHandshake className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {stats.rescued_count}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Persons sheltered or helped</p>
          </CardContent>
        </Card>

        {/* Located & Resolved */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Confirmed Located</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <LuCircleCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.resolved_count}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Verified safe & reunited</p>
          </CardContent>
        </Card>

        {/* In Triage / Review */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">In Verification</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <LuClock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {stats.pending_verification_count}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Under active responder review</p>
          </CardContent>
        </Card>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="inline-flex rounded-xl bg-muted/60 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("missing")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              activeTab === "missing"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LuTriangleAlert className="h-3.5 w-3.5 text-red-500" />
            <span>Missing Loved Ones ({missingReports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rescued")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              activeTab === "rescued"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LuHeartHandshake className="h-3.5 w-3.5 text-blue-500" />
            <span>Rescued / Sheltered ({rescuedReports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All Records ({allReports.length})</span>
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{currentList.length}</strong> incidents
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <LuCircleAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchReports} className="h-7 text-xs">
            Try Again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && !reportsData && (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <LuLoader className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs">Fetching your incident records...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && currentList.length === 0 && (
        <Card className="border-dashed border-border/80 bg-muted/20 text-center py-12 px-4">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              {activeTab === "missing" ? (
                <LuTriangleAlert className="h-7 w-7 text-red-500/70" />
              ) : activeTab === "rescued" ? (
                <LuHeartHandshake className="h-7 w-7 text-blue-500/70" />
              ) : (
                <LuSearch className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {activeTab === "missing"
                  ? "No Missing Person Reports Filed"
                  : activeTab === "rescued"
                  ? "No Rescued Person Notices Filed"
                  : "No Reports Found"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {activeTab === "missing"
                  ? "If someone you know is missing in the disaster zone, submit a report to initiate AI-powered cross-matching across all relief camps and hospitals."
                  : activeTab === "rescued"
                  ? "If you have helped rescue or found someone in shelter, submit a report so their searching families can be notified immediately."
                  : "You have not filed any incident reports under this account yet."}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              {activeTab !== "rescued" && (
                <Link
                  href="/report/missing"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "h-9 px-3.5 gap-1.5 bg-red-600 hover:bg-red-500 text-white inline-flex items-center justify-center font-medium"
                  )}
                >
                  <LuPlus className="h-4 w-4 shrink-0" />
                  <span>Report Missing Person</span>
                </Link>
              )}
              {activeTab !== "missing" && (
                <Link
                  href="/report/rescued"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-9 px-3.5 gap-1.5 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 inline-flex items-center justify-center font-medium"
                  )}
                >
                  <LuPlus className="h-4 w-4 shrink-0" />
                  <span>Report Rescued Person</span>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentList.map((rep) => {
          const isMissing = rep.report_type === "MISSING";
          const isResolved = rep.status === "RESOLVED_LOCATED";
          const isPending = rep.status === "PENDING_VERIFICATION" || rep.match_info?.match_status === "PENDING_VERIFICATION";

          return (
            <Card
              key={rep.id}
              className={`overflow-hidden border transition-all hover:shadow-md ${
                isResolved
                  ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                  : isPending
                  ? "border-amber-500/40 bg-amber-500/[0.02]"
                  : "border-border/60 bg-card/90"
              }`}
            >
              {/* Top Banner with Type & Status */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/30">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                      isMissing
                        ? "bg-red-500/10 text-red-600 border border-red-500/20"
                        : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                    }`}
                  >
                    {isMissing ? (
                      <>
                        <LuTriangleAlert className="h-3 w-3" />
                        <span>Missing Person</span>
                      </>
                    ) : (
                      <>
                        <LuHeartHandshake className="h-3 w-3" />
                        <span>Rescued / Sheltered</span>
                      </>
                    )}
                  </span>

                  {rep.is_minor && (
                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20">
                      Minor (Under 18)
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                {isResolved ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                    <LuCircleCheck className="h-3 w-3" />
                    <span>Located & Safe</span>
                  </Badge>
                ) : isPending ? (
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px]">
                    <LuClock className="h-3 w-3 animate-pulse" />
                    <span>Under Verification</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground gap-1 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>Active Search</span>
                  </Badge>
                )}
              </div>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Person Info Row */}
                <div className="flex items-start gap-3.5">
                  {/* Photo or placeholder */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/60 flex items-center justify-center">
                    {rep.photo_path ? (
                      <img
                        src={`${BACKEND_URL}/${rep.photo_path}`}
                        alt={rep.first_name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${rep.first_name?.charAt(0)}</span>`;
                        }}
                      />
                    ) : (
                      <LuUser className="h-8 w-8 text-muted-foreground/60" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {rep.first_name} {rep.last_name || ""}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span>Age: {rep.approximate_age ? `${rep.approximate_age} yrs` : "Unknown"}</span>
                      <span>•</span>
                      <span className="capitalize">{rep.gender?.toLowerCase()}</span>
                      <span>•</span>
                      <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5 truncate">
                      <LuMapPin className="h-3.5 w-3.5 shrink-0 text-red-500/80" />
                      <span className="truncate">{rep.last_known_location}</span>
                    </div>
                  </div>
                </div>

                {/* Outcome & Match Resolution Callout */}
                {isResolved && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <LuCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        {isMissing
                          ? "Person Successfully Located!"
                          : "Family Connection Established!"}
                      </span>
                    </div>
                    <p className="text-emerald-700/90 dark:text-emerald-400 text-[11px] leading-relaxed">
                      {isMissing ? (
                        <>
                          Your loved one has been confirmed safe at:{" "}
                          <strong className="underline">
                            {rep.match_info?.facility || "Emergency Care Facility"}
                          </strong>
                          . Rescue dispatch has marked this case resolved.
                        </>
                      ) : (
                        <>
                          The individual you reported rescued has been matched with their searching family! Status:{" "}
                          <strong className="underline">
                            {rep.match_info?.confirmed_status || "SHELTERED"}
                          </strong>
                          .
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Pending Verification Notice */}
                {!isResolved && isPending && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <LuClock className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
                      <span>Possible Match Being Verified</span>
                    </div>
                    <p className="text-amber-700/90 dark:text-amber-400 text-[11px]">
                      A high-probability match was flagged by the automated matching engine. Staff responders are actively confirming physical details.
                    </p>
                  </div>
                )}

                {/* Unmatched Status Notice */}
                {!isResolved && !isPending && (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span>
                      {isMissing
                        ? "Active emergency search in progress across all regional rescue registries."
                        : "Safely sheltered. Actively cross-checking incoming missing inquiries."}
                    </span>
                  </div>
                )}

                {/* Footer Controls: Tracking Code & Links */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  {/* Tracking Code */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Code:</span>
                    <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded text-[11px]">
                      {rep.tracking_code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(rep.tracking_code)}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                      title="Copy Tracking Code"
                    >
                      {copiedCode === rep.tracking_code ? (
                        <LuCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <LuCopy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Public Tracking Link */}
                  <Link
                    href={`/track/${rep.tracking_code}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "h-8 gap-1.5 text-primary hover:text-primary/80 font-medium text-xs px-2.5 inline-flex items-center"
                    )}
                  >
                    <span>Track Timeline</span>
                    <LuExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
