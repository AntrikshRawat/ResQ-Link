"use client";

/**
 * Circular SVG confidence gauge (0–100%).
 * @param {{ value: number|null, label: string, size?: number }} props
 */
export default function ConfidenceGauge({ value, label, size = 80 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = value != null ? Math.max(0, Math.min(value * 100, 100)) : null;
  const offset = safeValue != null
    ? circumference - (safeValue / 100) * circumference
    : circumference;

  // Color based on score
  let strokeColor = "stroke-muted-foreground/20";
  let textColor = "text-muted-foreground";
  if (safeValue != null) {
    if (safeValue >= 75) {
      strokeColor = "stroke-green-500";
      textColor = "text-green-600 dark:text-green-400";
    } else if (safeValue >= 50) {
      strokeColor = "stroke-amber-500";
      textColor = "text-amber-600 dark:text-amber-400";
    } else {
      strokeColor = "stroke-red-500";
      textColor = "text-red-600 dark:text-red-400";
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          className="stroke-muted"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${strokeColor} transition-all duration-700 ease-out`}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className={`text-lg font-bold tabular-nums ${textColor}`}>
          {safeValue != null ? `${Math.round(safeValue)}%` : "N/A"}
        </span>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
