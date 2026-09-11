"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LuEye, LuTrash2, LuChevronLeft, LuChevronRight } from "react-icons/lu";

const statusColors = {
  MISSING: "bg-red-500/10 text-red-600 border-red-500/20",
  SHELTERED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  RESCUED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  HOSPITALIZED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  HOSPITAL_PATIENT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  REUNITED: "bg-green-500/10 text-green-600 border-green-500/20",
  RESOLVED_LOCATED: "bg-green-500/10 text-green-600 border-green-500/20",
  DECEASED: "bg-muted text-muted-foreground border-border",
  UNIDENTIFIED_BODY: "bg-muted text-muted-foreground border-border",
};

/**
 * Paginated data table for master person and intake records.
 * @param {{
 *   data: object[],
 *   page: number,
 *   onPageChange: (page: number) => void,
 *   onView: (person: object) => void,
 *   onDelete: (person: object) => void
 * }} props
 */
export default function RecordsTable({ data, page, onPageChange, onView, onDelete }) {
  const pageSize = 20;
  const totalPages = Math.ceil(data.length / pageSize);
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="sticky top-0 font-semibold">Name & Identifier</TableHead>
              <TableHead className="sticky top-0 font-semibold">Category / Status</TableHead>
              <TableHead className="sticky top-0 font-semibold hidden sm:table-cell">
                Facility / Location
              </TableHead>
              <TableHead className="sticky top-0 font-semibold hidden md:table-cell text-center">
                Type
              </TableHead>
              <TableHead className="sticky top-0 font-semibold hidden lg:table-cell">
                Last Updated
              </TableHead>
              <TableHead className="sticky top-0 font-semibold w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No records found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((person) => {
                const statusKey = person.confirmed_status || person.category || person.report_type || "UNKNOWN";
                return (
                  <TableRow key={person.id} className="group hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span>
                          {person.canonical_first_name} {person.canonical_last_name || ""}
                        </span>
                        {person.tracking_code && (
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {person.tracking_code}
                          </Badge>
                        )}
                        {person.record_kind === "MASTER_PERSON" && (
                          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                            Unified Master
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          statusColors[statusKey] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {statusKey}
                      </span>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {person.current_facility || "—"}
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-center">
                      {person.record_kind === "MASTER_PERSON" ? (
                        <Badge variant="secondary">
                          {person.merged_report_ids?.length || 0} reports
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {person.report_type || "Intake Report"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {person.updatedAt
                        ? new Date(person.updatedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => onView(person)}
                          title="View Details"
                        >
                          <LuEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(person)}
                          title="Delete Record"
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)}{" "}
            of {data.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              <LuChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              <LuChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
