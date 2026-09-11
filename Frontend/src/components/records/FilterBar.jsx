"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuSearch, LuSlidersHorizontal, LuX } from "react-icons/lu";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "SHELTERED", label: "Sheltered" },
  { value: "HOSPITALIZED", label: "Hospitalized" },
  { value: "REUNITED", label: "Reunited" },
  { value: "DECEASED", label: "Deceased" },
];

/**
 * Filter bar with search and status filter.
 * @param {{ filters: object, onChange: (filters: object) => void }} props
 */
export default function FilterBar({ filters, onChange }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="LuSearch by name..."
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className={expanded ? "border-primary" : ""}
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
            {statusOptions.map((opt) => (
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
              className="gap-1 text-muted-foreground"
            >
              <LuX className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
