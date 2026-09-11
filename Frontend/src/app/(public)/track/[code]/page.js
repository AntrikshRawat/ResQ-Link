"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProgressTimeline from "@/components/tracking/ProgressTimeline";
import StatusBadge from "@/components/tracking/StatusBadge";
import { mockReports } from "@/lib/mock-data";
import { LuPhone, LuMail, LuShield, LuMapPin, LuUser, LuCalendar } from "react-icons/lu";

// In production, this would use TanStack Query with refetchInterval: 5000
// to poll the GET /api/v1/reports/track/:code endpoint.

export default function TrackingPage() {
  const params = useParams();
  const code = params.code;

  // Mock: find report by tracking code
  const report = mockReports.find((r) => r.tracking_code === code);

  if (!report) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <LuShield className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Report Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          No report found with tracking code{" "}
          <span className="font-mono font-semibold">{code}</span>. Please
          double-check the code and try again.
        </p>
      </div>
    );
  }

  const ageDisplay = report.is_minor
    ? "Under 18"
    : report.approximate_age
    ? `~${report.approximate_age} years`
    : "Unknown";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Tracking Code</p>
        <h1 className="mt-1 font-mono text-2xl font-bold tracking-widest sm:text-3xl">
          {report.tracking_code}
        </h1>
        <div className="mt-4">
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Progress Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTimeline status={report.status} />
          </CardContent>
        </Card>

        {/* Person Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Person Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <LuUser className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Name</span>
                <span className="ml-auto font-medium">
                  {report.first_name} {report.last_name || ""}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <LuCalendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Age</span>
                <span className="ml-auto font-medium">{ageDisplay}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <LuMapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location</span>
                <span className="ml-auto font-medium text-right max-w-[60%]">
                  {report.is_minor
                    ? "Withheld for minor protection"
                    : report.status === "RESOLVED_LOCATED"
                    ? report.last_known_location
                    : "Will be shared once located"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <LuShield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Report Type</span>
                <span className="ml-auto font-medium capitalize">
                  {report.report_type.toLowerCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="tel:112"
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-blue-500/10"
            >
              <LuPhone className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Emergency Helpline</p>
                <p className="text-xs text-muted-foreground">112</p>
              </div>
            </a>
            <a
              href="mailto:help@resqlink.org"
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-blue-500/10"
            >
              <LuMail className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Email Support</p>
                <p className="text-xs text-muted-foreground">help@resqlink.org</p>
              </div>
            </a>
          </CardContent>
        </Card>

        {/* Auto-refresh notice */}
        <p className="text-center text-xs text-muted-foreground">
          This page auto-refreshes every 5 seconds for live updates.
        </p>
      </div>
    </div>
  );
}
