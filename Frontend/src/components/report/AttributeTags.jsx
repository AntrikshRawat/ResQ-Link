"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const attributeGroups = [
  {
    label: "Height",
    options: ["Short", "Average", "Tall"],
  },
  {
    label: "Build",
    options: ["Slim", "Medium", "Heavy"],
  },
  {
    label: "Hair Color",
    options: ["Black", "Brown", "Gray", "White", "Other"],
  },
  {
    label: "Hair Style",
    options: ["Short", "Medium", "Long", "Bald"],
  },
];

/**
 * Selectable tag chips for physical attributes.
 * @param {{ value: Record<string, string>, onChange: (val: Record<string, string>) => void }} props
 */
export default function AttributeTags({ value = {}, onChange }) {
  function handleSelect(group, option) {
    const next = { ...value };
    if (next[group] === option) {
      delete next[group];
    } else {
      next[group] = option;
    }
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {attributeGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = value[group.label] === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(group.label, option)}
                  className={cn(
                    "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-all",
                    isSelected
                      ? "border-red-500/40 bg-red-500/10 text-red-600 shadow-sm dark:text-red-400"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/50"
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
