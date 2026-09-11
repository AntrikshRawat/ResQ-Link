import { Badge } from "@/components/ui/badge";
import { LuTriangleAlert, LuCircleX, LuArrowLeftRight, LuMapPin } from "react-icons/lu";

/**
 * Renders discrepancy_summary JSONB as color-coded badges.
 * @param {{ summary: object }} props
 */
export default function DiscrepancyBadges({ summary }) {
  if (!summary || Object.keys(summary).length === 0) return null;

  const badges = [];

  if (summary.gender_mismatch) {
    badges.push({
      key: "gender",
      label: "Gender Mismatch",
      icon: LuCircleX,
      variant: "destructive",
    });
  }

  if (summary.age_delta != null) {
    const severity =
      summary.age_delta > 10 ? "destructive" : summary.age_delta > 3 ? "outline" : "secondary";
    badges.push({
      key: "age",
      label: `Age Δ ${summary.age_delta}y`,
      icon: LuArrowLeftRight,
      variant: severity,
    });
  }

  if (summary.name_variation) {
    badges.push({
      key: "name",
      label: summary.name_variation,
      icon: LuTriangleAlert,
      variant: "outline",
    });
  }

  if (summary.location_distance_km != null) {
    const severity =
      summary.location_distance_km > 100 ? "destructive" : "secondary";
    badges.push({
      key: "location",
      label: `${summary.location_distance_km} km apart`,
      icon: LuMapPin,
      variant: severity,
    });
  }

  if (summary.clothing_match) {
    const variant =
      summary.clothing_match === "none"
        ? "destructive"
        : summary.clothing_match === "partial"
        ? "outline"
        : "secondary";
    badges.push({
      key: "clothing",
      label: `Clothing: ${summary.clothing_match}`,
      icon: LuTriangleAlert,
      variant: variant,
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <Badge key={badge.key} variant={badge.variant} className="gap-1 text-xs">
            <Icon className="h-3 w-3" />
            {badge.label}
          </Badge>
        );
      })}
    </div>
  );
}
