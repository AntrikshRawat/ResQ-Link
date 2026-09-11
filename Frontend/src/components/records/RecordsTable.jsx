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
import { LuEye, LuChevronLeft, LuChevronRight } from "react-icons/lu";

const statusColors = {
  SHELTERED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  HOSPITALIZED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  REUNITED: "bg-green-500/10 text-green-600 border-green-500/20",
  DECEASED: "bg-muted text-muted-foreground border-border",
};

/**
 * Paginated data table for master person records.
 * @param {{ data: object[], page: number, onPageChange: (page: number) => void, onView: (person: object) => void }} props
 */
export default function RecordsTable({ data, page, onPageChange, onView }) {
  const pageSize = 20;
  const totalPages = Math.ceil(data.length / pageSize);
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="sticky top-0 font-semibold">Name</TableHead>
              <TableHead className="sticky top-0 font-semibold">Status</TableHead>
              <TableHead className="sticky top-0 font-semibold hidden sm:table-cell">
                Facility
              </TableHead>
              <TableHead className="sticky top-0 font-semibold hidden md:table-cell text-center">
                Merged Reports
              </TableHead>
              <TableHead className="sticky top-0 font-semibold hidden lg:table-cell">
                Last Updated
              </TableHead>
              <TableHead className="sticky top-0 font-semibold w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((person) => (
                <TableRow key={person.id} className="group">
                  <TableCell className="font-medium">
                    {person.canonical_first_name} {person.canonical_last_name || ""}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        statusColors[person.confirmed_status] || ""
                      }`}
                    >
                      {person.confirmed_status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {person.current_facility}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <Badge variant="secondary">
                      {person.merged_report_ids.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {new Date(person.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onView(person)}
                    >
                      <LuEye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
