"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/records/FilterBar";
import RecordsTable from "@/components/records/RecordsTable";
import CsvUploadDialog from "@/components/records/CsvUploadDialog";
import RecordDetailDialog from "@/components/records/RecordDetailDialog";
import { getMasterPersons, deleteRecord } from "@/lib/api";
import { LuDatabase, LuDownload, LuLoader, LuRefreshCw } from "react-icons/lu";

export default function RecordsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [page, setPage] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["persons", filters],
    queryFn: () => getMasterPersons(filters),
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["triage-stats"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setSelectedPerson(null);
    },
  });

  function handleDelete(person) {
    if (!person || deleteMutation.isPending) return;
    const displayName =
      `${person.canonical_first_name || ""} ${person.canonical_last_name || ""}`.trim() ||
      person.tracking_code ||
      "this record";
    if (
      window.confirm(
        `Are you sure you want to permanently delete ${displayName}? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(person.id);
    }
  }

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
          .includes(filters.search.toLowerCase()) ||
        (p.tracking_code && p.tracking_code.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesStatus =
        !filters.status ||
        p.confirmed_status === filters.status ||
        p.category === filters.status ||
        p.report_type === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [masterPersons, filters]);

  function handleExport() {
    const headers = ["Name", "Category/Status", "Identifier", "Facility/Location", "Record Type", "Updated"];
    const rows = filteredData.map((p) => [
      `"${(p.canonical_first_name || "") + " " + (p.canonical_last_name || "")}"`,
      p.confirmed_status || p.category || "",
      p.tracking_code || p.id || "",
      `"${p.current_facility || ""}"`,
      p.record_kind || "REPORT",
      p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resqlink-records-${new Date().toISOString().slice(0, 10)}.csv`;
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
            Complete database of missing persons, sheltered individuals, and unified records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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

      {/* Delete Feedback Error */}
      {deleteMutation.isError && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          {deleteMutation.error?.message || "Failed to delete record. Please try again."}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4">
        <FilterBar filters={filters} onChange={(f) => { setFilters(f); setPage(0); }} />
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
        onDelete={handleDelete}
      />

      {/* Person Detail Modal */}
      {selectedPerson && (
        <RecordDetailDialog
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
