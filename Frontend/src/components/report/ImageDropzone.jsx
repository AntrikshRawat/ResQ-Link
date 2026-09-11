"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { LuUpload, LuX, LuImage } from "react-icons/lu";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Drag-and-drop image upload with preview.
 * @param {{ value: File|null, onChange: (file: File|null) => void }} props
 */
export default function ImageDropzone({ value, onChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const validateAndSet = useCallback(
    (file) => {
      setError("");
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please upload a JPEG, PNG, or WebP image.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be under 5MB.");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file);
    },
    [onChange]
  );

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onChange(null);
    setError("");
  }

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border">
        <img
          src={preview}
          alt="LuUpload preview"
          className="h-64 w-full object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute right-3 top-3 h-8 w-8 rounded-full shadow-lg"
          onClick={handleRemove}
        >
          <LuX className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p className="text-sm font-medium text-white">{value?.name}</p>
          <p className="text-xs text-white/70">
            {(value?.size / 1024).toFixed(0)} KB
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all",
          dragActive
            ? "border-red-500 bg-red-500/5"
            : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30"
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          {dragActive ? (
            <LuUpload className="h-6 w-6 text-red-500" />
          ) : (
            <LuImage className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">
            {dragActive ? "Drop image here" : "Drag & drop a photo, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, or WebP — max 5MB
          </p>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="sr-only"
        />
      </label>
      {error && (
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
