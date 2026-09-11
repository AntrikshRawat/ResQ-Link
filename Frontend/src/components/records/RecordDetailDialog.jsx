"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMasterPerson, BACKEND_URL } from "@/lib/api";
import {
  LuUser,
  LuMapPin,
  LuCalendar,
  LuFileText,
  LuCircleCheck,
  LuLoader,
  LuShieldAlert,
  LuTrash2,
} from "react-icons/lu";

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

export default function RecordDetailDialog({ person, onClose, onDelete }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ["person-detail", person?.id],
    queryFn: () => getMasterPerson(person.id),
    enabled: !!person?.id,
    retry: 1,
  });

  const detail = response?.data || person;
  const mergedReports = detail?.merged_reports || [];

  return (
    <Dialog open={!!person} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <LuUser className="h-5 w-5 text-primary" />
              {detail?.canonical_first_name} {detail?.canonical_last_name || ""}
            </DialogTitle>
            {detail?.confirmed_status && (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  statusColors[detail.confirmed_status] || ""
                }`}
              >
                {detail.confirmed_status}
              </span>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LuLoader className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading record details...</p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Facility & Meta */}
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Current Facility</span>
                <p className="mt-1 flex items-center gap-1.5 font-medium">
                  <LuMapPin className="h-4 w-4 text-muted-foreground" />
                  {detail?.current_facility || "Unknown facility"}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Record ID</span>
                <p className="mt-1 font-mono text-xs text-muted-foreground truncate">
                  {detail?.id}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Confirmed Status</span>
                <p className="mt-1 font-medium">{detail?.confirmed_status}</p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Last Updated</span>
                <p className="mt-1 font-medium text-muted-foreground">
                  {detail?.updatedAt
                    ? new Date(detail.updatedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {/* Photo if available */}
            {detail?.primary_photo_path && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Identity Photo</span>
                <div className="mt-2 h-44 w-44 overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={`${BACKEND_URL}/${detail.primary_photo_path}`}
                    alt={detail.canonical_first_name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Merged Source Reports */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <LuFileText className="h-4 w-4 text-muted-foreground" />
                  Merged Reports ({mergedReports.length || detail?.merged_report_ids?.length || 0})
                </span>
                <Badge variant="secondary" className="text-xs">
                  Unified Identity
                </Badge>
              </div>

              {mergedReports.length > 0 ? (
                <div className="space-y-3">
                  {mergedReports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-lg border border-border bg-card p-3.5 text-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={report.report_type === "MISSING" ? "destructive" : "default"}
                            className="text-[10px]"
                          >
                            {report.report_type}
                          </Badge>
                          <span className="font-semibold">
                            {report.first_name} {report.last_name || ""}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {report.tracking_code}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Channel:</span> {report.source_channel}
                        </div>
                        <div>
                          <span className="font-medium">Age / Gender:</span>{" "}
                          {report.approximate_age ? `${report.approximate_age}y` : "—"}, {report.gender}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Location:</span> {report.last_known_location}
                        </div>
                        {report.distinguishing_marks && (
                          <div className="col-span-2 italic">
                            Marks: &ldquo;{report.distinguishing_marks}&rdquo;
                          </div>
                        )}
                        {report.clothing_description && (
                          <div className="col-span-2">
                            Clothing: {report.clothing_description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  {detail?.merged_report_ids?.length || 0} reports unified under this master record.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              {onDelete ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onDelete(detail)}
                >
                  <LuTrash2 className="h-4 w-4" /> Delete Record
                </Button>
              ) : <div />}
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
