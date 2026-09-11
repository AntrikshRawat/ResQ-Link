"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import MatchCard from "@/components/triage/MatchCard";
import { mockMatchCandidates } from "@/lib/mock-data";
import { LuGitCompareArrows, LuFilter } from "react-icons/lu";

export default function TriagePage() {
  const [matches, setMatches] = useState(
    mockMatchCandidates.filter((m) => m.status === "PENDING_REVIEW")
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMatch = matches[currentIndex];

  const handleApprove = useCallback(() => {
    setMatches((prev) =>
      prev.map((m, i) => (i === currentIndex ? { ...m, status: "APPROVED" } : m))
    );
    setCurrentIndex((i) => Math.min(i + 1, matches.length - 1));
  }, [currentIndex, matches.length]);

  const handleDismiss = useCallback(() => {
    setMatches((prev) =>
      prev.map((m, i) => (i === currentIndex ? { ...m, status: "DISMISSED" } : m))
    );
    setCurrentIndex((i) => Math.min(i + 1, matches.length - 1));
  }, [currentIndex, matches.length]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") handleApprove();
      if (e.key === "d" || e.key === "D") handleDismiss();
      if (e.key === "ArrowRight")
        setCurrentIndex((i) => Math.min(i + 1, matches.length - 1));
      if (e.key === "ArrowLeft") setCurrentIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleApprove, handleDismiss, matches.length]);

  const pendingCount = matches.filter((m) => m.status === "PENDING_REVIEW").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <LuGitCompareArrows className="h-6 w-6 text-muted-foreground" />
            Triage Console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review AI-generated match candidates. Use keyboard:{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">A</kbd>{" "}
            Approve,{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">D</kbd>{" "}
            Dismiss,{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">←→</kbd>{" "}
            Navigate
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {pendingCount} pending
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {currentIndex + 1} / {matches.length}
          </Badge>
        </div>
      </div>

      {/* Match card or empty state */}
      {currentMatch ? (
        <div className="mx-auto max-w-3xl">
          <MatchCard
            match={currentMatch}
            onApprove={handleApprove}
            onDismiss={handleDismiss}
          />

          {/* Navigation dots */}
          <div className="mt-4 flex justify-center gap-1.5">
            {matches.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "w-6 bg-foreground"
                    : m.status === "APPROVED"
                    ? "w-2 bg-green-500"
                    : m.status === "DISMISSED"
                    ? "w-2 bg-red-500"
                    : "w-2 bg-muted-foreground/30"
                }`}
                aria-label={`Go to match ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <LuGitCompareArrows className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Queue Empty</h2>
          <p className="mt-1 text-muted-foreground">
            All match candidates have been reviewed. Check back later.
          </p>
        </div>
      )}
    </div>
  );
}
