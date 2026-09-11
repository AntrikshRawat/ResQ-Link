"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { LuFileText, LuUsers, LuSearch, LuHeart } from "react-icons/lu";
import { getMetrics } from "@/lib/api";

const metrics = [
  {
    key: "total_reports",
    label: "Reports Filed",
    icon: LuFileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "people_matched",
    label: "People Matched",
    icon: LuUsers,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    key: "active_searches",
    label: "Active Searches",
    icon: LuSearch,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    key: "families_reunited",
    label: "Families Reunited",
    icon: LuHeart,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
];

/** Animated counter that counts up to the target value */
function AnimatedCounter({ target = 0, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const endVal = Number(target) || 0;
    if (endVal === 0) {
      setCount(0);
      return;
    }

    const startTime = performance.now();
    let animationFrame;

    function step(timestamp) {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * endVal));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    }

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
    </span>
  );
}

export default function MetricsTicker() {
  const { data } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => getMetrics(),
    retry: 1,
  });

  const metricsData = {
    total_reports: data?.total_reports ?? data?.totalReports ?? 0,
    people_matched: data?.people_matched ?? data?.peopleMatched ?? 0,
    active_searches: data?.active_searches ?? data?.activeSearches ?? 0,
    families_reunited: data?.families_reunited ?? data?.familiesReunited ?? 0,
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.key}
                className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-md"
              >
                <CardContent className="flex flex-col items-center gap-2 p-5 text-center sm:p-6">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <span className="text-2xl font-bold sm:text-3xl">
                    <AnimatedCounter target={metricsData[metric.key] || 0} />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                    {metric.label}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
