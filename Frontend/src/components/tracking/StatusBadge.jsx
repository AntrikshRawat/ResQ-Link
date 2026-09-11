import { cn } from "@/lib/utils";
import { LuClock, LuSearch, LuCircleCheck, LuCircleX } from "react-icons/lu";

const statusConfig = {
  UNMATCHED: {
    label: "Searching",
    icon: LuSearch,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  PENDING_VERIFICATION: {
    label: "Pending Verification",
    icon: LuClock,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  RESOLVED_LOCATED: {
    label: "Located",
    icon: LuCircleCheck,
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
  },
  CLOSED: {
    label: "Case Closed",
    icon: LuCircleX,
    className: "border-muted-foreground/30 bg-muted text-muted-foreground",
  },
};

/**
 * Large color-coded status badge.
 * @param {{ status: string }} props
 */
export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.UNMATCHED;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold",
        config.className
      )}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </div>
  );
}
