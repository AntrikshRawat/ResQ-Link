"use client";

import { cn } from "@/lib/utils";
import { LuCheck, LuCircle, LuLoader } from "react-icons/lu";

const allMilestones = [
  { key: "FILED", label: "Report Filed", description: "Your report has been received" },
  { key: "PROCESSING", label: "AI Processing", description: "Scanning for potential matches" },
  { key: "MATCH_FOUND", label: "Match Found", description: "A potential match was identified" },
  { key: "VERIFICATION", label: "Verification", description: "Staff reviewing the match" },
  { key: "RESOLVED", label: "Reunited", description: "Identity confirmed and family notified" },
];

const statusToStep = {
  UNMATCHED: 1,       // Filed + Processing
  PENDING_VERIFICATION: 3, // Through Match Found + Verification in progress
  RESOLVED_LOCATED: 4,     // Through Verification
  CLOSED: 5,               // All complete
};

/**
 * Vertical progress timeline.
 * @param {{ status: string }} props
 */
export default function ProgressTimeline({ status }) {
  const completedSteps = statusToStep[status] || 0;

  return (
    <div className="relative space-y-0">
      {allMilestones.map((milestone, index) => {
        const isCompleted = index < completedSteps;
        const isCurrent = index === completedSteps;
        const isFuture = index > completedSteps;

        return (
          <div key={milestone.key} className="relative flex gap-4">
            {/* Vertical line */}
            {index < allMilestones.length - 1 && (
              <div
                className={cn(
                  "absolute left-[17px] top-10 h-[calc(100%-16px)] w-0.5",
                  isCompleted ? "bg-green-500" : "bg-border"
                )}
              />
            )}

            {/* Step indicator */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                  isCompleted &&
                    "border-green-500 bg-green-500 text-white shadow-md shadow-green-500/25",
                  isCurrent &&
                    "border-blue-500 bg-blue-500/10 text-blue-500 ring-4 ring-blue-500/10",
                  isFuture && "border-muted-foreground/20 text-muted-foreground/30"
                )}
              >
                {isCompleted ? (
                  <LuCheck className="h-4 w-4" />
                ) : isCurrent ? (
                  <LuLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <LuCircle className="h-3 w-3" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="pb-8">
              <p
                className={cn(
                  "text-sm font-semibold",
                  isCompleted && "text-green-600 dark:text-green-400",
                  isCurrent && "text-blue-600 dark:text-blue-400",
                  isFuture && "text-muted-foreground/50"
                )}
              >
                {milestone.label}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm",
                  isFuture ? "text-muted-foreground/30" : "text-muted-foreground"
                )}
              >
                {milestone.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
