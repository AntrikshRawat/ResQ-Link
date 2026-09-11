"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MatchCard from "@/components/triage/MatchCard";
import { getMatchCandidates, getTriageStats, verifyMatch, deleteMatchCandidate } from "@/lib/api";
import { LuGitCompareArrows, LuLoader, LuTriangleAlert, LuRefreshCw } from "react-icons/lu";

export default function TriagePage() {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");

  // ── Fetch triage stats (counts for tabs) ───────────────────────────────
  const { data: statsResponse } = useQuery({
    queryKey: ["triage-stats"],
    queryFn: () => getTriageStats(),
    retry: 1,
  });
  const stats = statsResponse?.data || { pending: 0, approved: 0, dismissed: 0, total: 0 };

  // ── Fetch candidates from backend ──────────────────────────────────────
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["candidates", statusFilter],
    queryFn: () => getMatchCandidates({ status: statusFilter, minScore: 0.50, limit: 30 }),
    retry: 1,
  });

  const matches = response?.data ?? [];
  const currentMatch = matches[currentIndex];

  // Reset index when tab changes or data length shrinks
  useEffect(() => {
    setCurrentIndex(0);
  }, [statusFilter]);

  // ── Verify mutation (approve / dismiss) ────────────────────────────────
  const mutation = useMutation({
    mutationFn: ({ candidateId, decision }) =>
      verifyMatch(candidateId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["triage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["persons"] });

      setCurrentIndex((i) => {
        const newLength = matches.length - 1;
        return i >= newLength ? Math.max(newLength - 1, 0) : i;
      });
    },
  });

  // ── Delete candidate mutation ─────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (candidateId) => deleteMatchCandidate(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["triage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });

      setCurrentIndex((i) => {
        const newLength = matches.length - 1;
        return i >= newLength ? Math.max(newLength - 1, 0) : i;
      });
    },
  });

  const handleApprove = useCallback(() => {
    if (!currentMatch || mutation.isPending || deleteMutation.isPending) return;
    mutation.mutate({
      candidateId: currentMatch.id,
      decision: "APPROVE",
    });
  }, [currentMatch, mutation, deleteMutation.isPending]);

  const handleDismiss = useCallback(() => {
    if (!currentMatch || mutation.isPending || deleteMutation.isPending) return;
    mutation.mutate({
      candidateId: currentMatch.id,
      decision: "DISMISS",
    });
  }, [currentMatch, mutation, deleteMutation.isPending]);

  const handleDelete = useCallback(() => {
    if (!currentMatch || mutation.isPending || deleteMutation.isPending) return;
    if (window.confirm("Are you sure you want to permanently delete this match candidate?")) {
      deleteMutation.mutate(currentMatch.id);
    }
  }, [currentMatch, mutation.isPending, deleteMutation]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (statusFilter === "PENDING_REVIEW") {
        if (e.key === "a" || e.key === "A") handleApprove();
        if (e.key === "d" || e.key === "D") handleDismiss();
      }
      if (e.key === "ArrowRight")
        setCurrentIndex((i) => Math.min(i + 1, matches.length - 1));
      if (e.key === "ArrowLeft") setCurrentIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleApprove, handleDismiss, matches.length, statusFilter]);

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
            Review AI-generated match candidates.
            {statusFilter === "PENDING_REVIEW" && (
              <>
                {" "}Use keyboard:{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">A</kbd>{" "}
                Approve,{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">D</kbd>{" "}
                Dismiss,{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">←→</kbd>{" "}
                Navigate
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <LuRefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {matches.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {currentIndex + 1} / {matches.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setStatusFilter("PENDING_REVIEW")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "PENDING_REVIEW"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Pending Review
          <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
            {stats.pending}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter("APPROVED")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "APPROVED"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Approved
          <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
            {stats.approved}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter("DISMISSED")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "DISMISSED"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Dismissed
          <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
            {stats.dismissed}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter("ALL")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "ALL"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          All Candidates
          <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
            {stats.total}
          </span>
        </button>
      </div>

      {/* Mutation feedback — error banner */}
      {mutation.isError && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          {mutation.error?.message || "Failed to submit decision. Please try again."}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LuLoader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading match candidates…</p>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <LuTriangleAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Failed to load candidates</h2>
          <p className="mt-1 max-w-md text-muted-foreground">
            {error?.message || "Something went wrong. Please refresh the page."}
          </p>
        </div>
      )}

      {/* Match card or empty state */}
      {!isLoading && !isError && (
        currentMatch ? (
          <div className="mx-auto max-w-3xl">
            <MatchCard
              match={currentMatch}
              onApprove={handleApprove}
              onDismiss={handleDismiss}
              onDelete={handleDelete}
              isLoading={mutation.isPending || deleteMutation.isPending}
            />

            {/* Navigation dots */}
            {matches.length > 1 && (
              <div className="mt-4 flex justify-center gap-1.5">
                {matches.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? "w-6 bg-foreground"
                        : "w-2 bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to match ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <LuGitCompareArrows className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">
              {statusFilter === "PENDING_REVIEW" ? "Queue Empty" : "No Candidates Found"}
            </h2>
            <p className="mt-1 max-w-md text-muted-foreground">
              {statusFilter === "PENDING_REVIEW"
                ? "All match candidates have been reviewed. Try switching tabs to view Approved or Dismissed candidates."
                : `No candidates currently under ${statusFilter.toLowerCase().replace("_", " ")} status.`}
            </p>
          </div>
        )
      )}
    </div>
  );
}
