"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/records/FilterBar";
import RecordsTable from "@/components/records/RecordsTable";
import CsvUploadDialog from "@/components/records/CsvUploadDialog";
import RecordDetailDialog from "@/components/records/RecordDetailDialog";
import { getMasterPersons } from "@/lib/api";
import { LuDatabase, LuDownload, LuLoader, LuRefreshCw } from "react-icons/lu";

export default function RecordsPage() {
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [page, setPage] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["persons", filters],
    queryFn: () => getMasterPersons(filters),
    retry: 1,
  });

  const masterPersons = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.persons)) return data.persons;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const filteredData = useMemo(() => {
    return masterPersons.filter((p) => {
      const matchesSearch =
        !filters.search ||
        `${p.canonical_first_name || ""} ${p.canonical_last_name || ""}`
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || p.confirmed_status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [masterPersons, filters]);

  function handleExport() {
    // Build CSV string
    const headers = ["Name", "Status", "Facility", "Merged Reports", "Updated"];
    const rows = filteredData.map((p) => [
      `${p.canonical_first_name} ${p.canonical_last_name || ""}`,
      p.confirmed_status,
      p.current_facility,
      p.merged_report_ids.length,
      new Date(p.updatedAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resqlink-records.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <LuDatabase className="h-6 w-6 text-muted-foreground" />
            Records Registry
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consolidated master registry of confirmed identities.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
            <LuRefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <CsvUploadDialog />
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <LuDownload className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Stats */}
      <div className="mb-4 flex items-center gap-2">
        {isLoading ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LuLoader className="h-3.5 w-3.5 animate-spin" /> Loading records...
          </span>
        ) : (
          <Badge variant="secondary">{filteredData.length} records</Badge>
        )}
        {filters.status && (
          <Badge variant="outline">{filters.status}</Badge>
        )}
      </div>

      {/* Table */}
      <RecordsTable
        data={filteredData}
        page={page}
        onPageChange={setPage}
        onView={setSelectedPerson}
      />

      {/* Person Detail Modal */}
      {selectedPerson && (
        <RecordDetailDialog
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}
