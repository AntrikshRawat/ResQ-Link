"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LuCamera, LuX, LuRotateCcw } from "react-icons/lu";

/**
 * Mobile-optimized camera capture component.
 * Uses HTML5 capture attribute to open device camera directly.
 * @param {{ value: File|null, onChange: (file: File|null) => void }} props
 */
export default function CameraCapture({ value, onChange }) {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  function handleCapture(e) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file);
    }
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRetake() {
    handleRemove();
    // Small delay so the input resets before reopening
    setTimeout(() => inputRef.current?.click(), 100);
  }

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border">
        <img
          src={preview}
          alt="Captured photo"
          className="h-56 w-full object-cover sm:h-64"
        />
        <div className="absolute bottom-0 left-0 right-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleRetake}
          >
            <LuRotateCcw className="mr-1.5 h-4 w-4" />
            Retake
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
          >
            <LuX className="mr-1.5 h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-green-500/30 bg-green-500/5 px-6 py-10 text-center transition-all hover:border-green-500/50 hover:bg-green-500/10 active:scale-[0.98]"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <LuCamera className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <p className="text-base font-semibold text-green-700 dark:text-green-400">
            Tap to Open LuCamera
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Take a photo of the rescued person
          </p>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="sr-only"
      />
    </div>
  );
}
