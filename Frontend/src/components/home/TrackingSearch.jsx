"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuSearch } from "react-icons/lu";

export default function TrackingSearch() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter a tracking code");
      return;
    }
    setError("");
    router.push(`/track/${trimmed}`);
  }

  return (
    <section className="border-y border-border/40 bg-muted/30 py-12">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold sm:text-2xl">
          Track a Report
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the tracking code you received when your report was filed to check the current status.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <div className="relative w-full max-w-sm">
            <LuSearch className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="e.g. RQL-2026-XK7M9P"
              className="h-12 pl-11 text-base font-mono tracking-wider"
              aria-label="Tracking code"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 min-w-[140px] text-base font-semibold"
          >
            Track
          </Button>
        </form>

        {error && (
          <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    </section>
  );
}
