"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ConfidenceGauge from "@/components/triage/ConfidenceGauge";
import DiscrepancyBadges from "@/components/triage/DiscrepancyBadges";
import { LuCircleCheck, LuCircleX, LuFlag, LuUser, LuMapPin, LuCalendar } from "react-icons/lu";

/**
 * Split-screen comparison card for triage review.
 * @param {{ match: object, onApprove: () => void, onDismiss: () => void }} props
 */
export default function MatchCard({ match, onApprove, onDismiss }) {
  const { sourceReport, targetReport } = match;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Scores header */}
        <div className="flex items-center justify-center gap-6 border-b border-border bg-muted/30 px-6 py-4">
          <div className="relative">
            <ConfidenceGauge value={match.composite_score} label="Composite" size={72} />
          </div>
          <div className="relative">
            <ConfidenceGauge value={match.face_similarity_score} label="Face" size={72} />
          </div>
          <div className="relative">
            <ConfidenceGauge value={match.phonetic_similarity_score} label="Phonetic" size={72} />
          </div>
        </div>

        {/* Split comparison */}
        <div className="grid md:grid-cols-2">
          {/* Source (Missing) */}
          <div className="border-b border-border p-5 md:border-b-0 md:border-r">
            <Badge variant="destructive" className="mb-3">
              MISSING
            </Badge>
            <PersonSummary report={sourceReport} />
          </div>

          {/* Target (Rescued) */}
          <div className="p-5">
            <Badge className="mb-3 bg-green-600 hover:bg-green-700">
              RESCUED
            </Badge>
            <PersonSummary report={targetReport} />
          </div>
        </div>

        {/* Discrepancies */}
        <div className="border-t border-border px-5 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Discrepancies
          </p>
          <DiscrepancyBadges summary={match.discrepancy_summary} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-border bg-muted/20 p-4">
          <Button
            variant="outline"
            className="flex-1 border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700"
            onClick={onApprove}
          >
            <LuCircleCheck className="mr-2 h-4 w-4" />
            Approve Match
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700"
            onClick={onDismiss}
          >
            <LuCircleX className="mr-2 h-4 w-4" />
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PersonSummary({ report }) {
  return (
    <div className="space-y-2.5 text-sm">
      <div className="flex items-center gap-2">
        <LuUser className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">
          {report.first_name} {report.last_name || ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <LuCalendar className="h-4 w-4 text-muted-foreground" />
        <span>
          {report.approximate_age ? `~${report.approximate_age}y` : "Unknown age"},{" "}
          {report.gender}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <LuMapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">{report.last_known_location}</span>
      </div>
      {report.distinguishing_marks && (
        <p className="text-xs text-muted-foreground italic">
          &ldquo;{report.distinguishing_marks}&rdquo;
        </p>
      )}
      {report.photo_path && (
        <div className="mt-2 h-32 w-full overflow-hidden rounded-lg bg-muted">
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            [Photo: {report.photo_path}]
          </div>
        </div>
      )}
    </div>
  );
}
