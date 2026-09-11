"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CameraCapture from "@/components/report/CameraCapture";
import { rescuedPersonSchema } from "@/lib/schemas/report-schema";
import { createReport } from "@/lib/api";
import { facilityOptions } from "@/lib/mock-data";

import { LuHeartHandshake, LuCircleCheck, LuLoader, LuCopy, LuCheck } from "react-icons/lu";

export default function ReportRescuedPage() {
  const [photo, setPhoto] = useState(null);
  const [trackingCode, setTrackingCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rescuedPersonSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      approximate_age: "",
      gender: "",
      distinguishing_marks: "",
      clothing_description: "",
      last_known_location: "",
      facility: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("report_type", "RESCUED");
      formData.append("source_channel", "RELIEF_CAMP");
      Object.entries(data).forEach(([key, val]) => {
        if (val !== "" && val !== undefined && val !== null) {
          formData.append(key, val);
        }
      });
      if (photo) formData.append("photo", photo);
      return createReport(formData);
    },
    onSuccess: (data) => {
      setTrackingCode(data.data.tracking_code);
    },
  });

  function onSubmit(data) {
    mutation.mutate(data);
  }

  async function copyCode() {
    if (trackingCode) {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // ── Success Screen ──────────────────────────────────────────────────────
  if (trackingCode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <LuCircleCheck className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Rescued Person Registered</h1>
        <p className="mt-2 text-muted-foreground">
          The record has been filed. Share this tracking code with the family.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-6 py-4">
          <span className="font-mono text-2xl font-bold tracking-widest">
            {trackingCode}
          </span>
          <button
            onClick={copyCode}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
            aria-label="Copy tracking code"
          >
            {copied ? (
              <LuCheck className="h-5 w-5 text-green-500" />
            ) : (
              <LuCopy className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => {
            setTrackingCode(null);
            setPhoto(null);
          }}>
            Register Another
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Register a Rescued Person</h1>
        <p className="mt-2 text-muted-foreground">
          Quick intake form for field workers. Large buttons optimized for mobile.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Camera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuHeartHandshake className="h-5 w-5 text-green-600" />
              Photo Capture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CameraCapture value={photo} onChange={setPhoto} />
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-base">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  placeholder="Enter first name"
                  className="h-12 text-base"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-base">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Enter last name"
                  className="h-12 text-base"
                  {...register("last_name")}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <select
                  id="gender"
                  {...register("gender")}
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="approximate_age" className="text-base">
                  Approximate Age
                </Label>
                <Input
                  id="approximate_age"
                  type="number"
                  placeholder="e.g. 25"
                  className="h-12 text-base"
                  {...register("approximate_age")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distinguishing_marks" className="text-base">
                Distinguishing Marks
              </Label>
              <Textarea
                id="distinguishing_marks"
                placeholder="Scars, tattoos, birthmarks..."
                rows={2}
                className="text-base"
                {...register("distinguishing_marks")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location / Facility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="facility" className="text-base">Shelter / Facility</Label>
              <select
                id="facility"
                {...register("facility")}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select facility (optional)</option>
                {facilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_known_location" className="text-base">
                Location Details <span className="text-destructive">*</span>
              </Label>
              <Input
                id="last_known_location"
                placeholder="Current location or where the person was found"
                className="h-12 text-base"
                {...register("last_known_location")}
              />
              {errors.last_known_location && (
                <p className="text-sm text-destructive">
                  {errors.last_known_location.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        {mutation.isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
            {mutation.error?.message || "Failed to submit. Please try again."}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="h-14 w-full text-lg font-semibold shadow-lg"
        >
          {mutation.isPending && <LuLoader className="mr-2 h-5 w-5 animate-spin" />}
          Submit Rescued Person Report
        </Button>
      </form>
    </div>
  );
}
