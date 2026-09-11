"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuUpload, LuFileText, LuLoader, LuCircleCheck } from "react-icons/lu";

/**
 * Modal dialog for bulk CSV import.
 */
export default function CsvUploadDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | done
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f && f.type === "text/csv") {
      setFile(f);
      setStatus("idle");
    }
  }

  async function handleUpload() {
    if (!file) return;
    setStatus("uploading");
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStatus("done");
  }

  function handleClose() {
    setOpen(false);
    setFile(null);
    setStatus("idle");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <LuUpload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Records from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {status === "done" ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <LuCircleCheck className="h-6 w-6 text-green-500" />
              </div>
              <p className="font-medium">Import Complete</p>
              <p className="text-sm text-muted-foreground">
                Records from <span className="font-mono">{file?.name}</span> have
                been imported.
              </p>
              <Button onClick={handleClose}>Done</Button>
            </div>
          ) : (
            <>
              <label
                onClick={() => inputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/20 px-6 py-8 text-center transition-colors hover:border-muted-foreground/40 hover:bg-muted/30"
              >
                <LuFileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {file ? file.name : "Click to select a CSV file"}
                </p>
                {file && (
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              <Button
                onClick={handleUpload}
                disabled={!file || status === "uploading"}
                className="w-full gap-2"
              >
                {status === "uploading" && (
                  <LuLoader className="h-4 w-4 animate-spin" />
                )}
                {status === "uploading" ? "Importing..." : "LuUpload & Import"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
