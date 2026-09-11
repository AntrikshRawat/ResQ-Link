"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuSearch, LuSlidersHorizontal, LuX } from "react-icons/lu";

export const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "MISSING", label: "Missing" },
  { value: "HOSPITALIZED", label: "Hospitalized" },
  { value: "SHELTERED", label: "Sheltered / Rescued" },
  { value: "REUNITED", label: "Reunited" },
  { value: "DECEASED", label: "Deceased" },
];

/**
 * Filter bar with search, category pill buttons, and advanced filters.
 * @param {{ filters: object, onChange: (filters: object) => void }} props
 */
export default function FilterBar({ filters, onChange }) {
  const [expanded, setExpanded] = useState(false);

  function handleCategoryClick(val) {
    onChange({ ...filters, status: val });
  }

  return (
    <div className="space-y-3">
      {/* Category Pill Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        {categoryOptions.map((opt) => {
          const isActive = (filters.status || "") === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleCategoryClick(opt.value)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Search and Expand */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by name or tracking code..."
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className={expanded ? "border-primary" : ""}
          title="Toggle filters"
        >
          <LuSlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <select
            value={filters.status || ""}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {(filters.search || filters.status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ search: "", status: "" })}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <LuX className="h-3 w-3" />
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
