"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LuTriangleAlert, LuHeartHandshake, LuArrowRight } from "react-icons/lu";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-background to-orange-950/10" />
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Urgency badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Active Emergency Response
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Every Second{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Counts
            </span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            ResQ-Link connects missing persons with their families through
            AI-powered facial recognition and real-time coordination between
            relief camps, hospitals, and helplines.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="group h-14 min-w-[240px] bg-gradient-to-r from-red-600 to-red-500 text-base font-semibold shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40 hover:brightness-110"
              asChild
            >
              <Link href="/report/missing" className="inline-flex items-center gap-2">
                <LuTriangleAlert className="h-5 w-5 shrink-0" />
                <span>Report Missing Person</span>
                <LuArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="group h-14 min-w-[240px] border-green-500/30 text-base font-semibold transition-all hover:border-green-500/60 hover:bg-green-500/5"
              asChild
            >
              <Link href="/report/rescued" className="inline-flex items-center gap-2">
                <LuHeartHandshake className="h-5 w-5 shrink-0 text-green-600" />
                <span>Report Rescued Person</span>
                <LuArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
