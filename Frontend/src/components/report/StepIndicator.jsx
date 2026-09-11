"use client";

import { cn } from "@/lib/utils";
import { LuCheck } from "react-icons/lu";

/**
 * Horizontal step indicator for multi-step forms.
 * @param {{ steps: string[], currentStep: number }} props
 */
export default function StepIndicator({ steps, currentStep }) {
  return (
    <nav aria-label="Form progress" className="w-full">
      <ol className="flex items-center">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={label} className="flex flex-1 items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                    isCompleted &&
                      "border-green-500 bg-green-500 text-white shadow-md shadow-green-500/25",
                    isCurrent &&
                      "border-red-500 bg-red-500/10 text-red-500 ring-4 ring-red-500/10",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/25 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <LuCheck className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCurrent && "text-foreground",
                    isCompleted && "text-green-600 dark:text-green-400",
                    !isCompleted && !isCurrent && "text-muted-foreground/60"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors duration-300",
                    isCompleted ? "bg-green-500" : "bg-muted-foreground/15"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
