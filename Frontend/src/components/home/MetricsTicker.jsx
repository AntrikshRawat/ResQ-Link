"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LuFileText, LuUsers, LuSearch, LuHeart } from "react-icons/lu";
import { mockMetrics } from "@/lib/mock-data";

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
function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
    </span>
  );
}

export default function MetricsTicker() {
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
                    <AnimatedCounter target={mockMetrics[metric.key]} />
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
