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
import { Badge } from "@/components/ui/badge";

import StepIndicator from "@/components/report/StepIndicator";
import ImageDropzone from "@/components/report/ImageDropzone";
import AttributeTags from "@/components/report/AttributeTags";
import { missingPersonSchema } from "@/lib/schemas/report-schema";
import { createReport } from "@/lib/api";

import { LuUser, LuEye, LuMapPin, LuCircleCheck, LuArrowRight, LuArrowLeft, LuLoader, LuCopy, LuCheck } from "react-icons/lu";

const STEPS = ["Identity", "Description", "Location & Photo", "Review"];

export default function ReportMissingPage() {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [attributes, setAttributes] = useState({});
  const [trackingCode, setTrackingCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(missingPersonSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      approximate_age: "",
      gender: "",
      distinguishing_marks: "",
      clothing_description: "",
      last_known_location: "",
    },
  });

  const values = watch();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("report_type", "MISSING");
      formData.append("source_channel", "PUBLIC_PORTAL");
      Object.entries(data).forEach(([key, val]) => {
        if (val !== "" && val !== undefined && val !== null) {
          formData.append(key, val);
        }
      });
      if (photo) formData.append("photo", photo);
      // Append attributes as part of distinguishing marks
      if (Object.keys(attributes).length > 0) {
        const attrStr = Object.entries(attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        const existing = data.distinguishing_marks || "";
        formData.set(
          "distinguishing_marks",
          existing ? `${existing}; ${attrStr}` : attrStr
        );
      }
      return createReport(formData);
    },
    onSuccess: (data) => {
      setTrackingCode(data.data.tracking_code);
    },
  });

  async function nextStep() {
    let fieldsToValidate = [];
    if (step === 0) fieldsToValidate = ["first_name", "gender"];
    if (step === 2) fieldsToValidate = ["last_known_location"];
    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

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
        <h1 className="mt-6 text-2xl font-bold">Report Submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Your report has been filed. Save this tracking code to check the status.
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
          <Button asChild>
            <a href={`/track/${trackingCode}`}>Track Status</a>
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // ── Form Steps ──────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Report a Missing Person</h1>
        <p className="mt-2 text-muted-foreground">
          Please provide as much detail as possible to help us find them.
        </p>
      </div>

      <div className="mb-10">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Identity */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LuUser className="h-5 w-5 text-muted-foreground" />
                Personal Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    placeholder="Enter first name"
                    {...register("first_name")}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Enter last name"
                    {...register("last_name")}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="approximate_age">Approximate Age</Label>
                  <Input
                    id="approximate_age"
                    type="number"
                    placeholder="e.g. 25"
                    {...register("approximate_age")}
                  />
                  {errors.approximate_age && (
                    <p className="text-sm text-destructive">
                      {errors.approximate_age.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Description */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LuEye className="h-5 w-5 text-muted-foreground" />
                Physical Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Physical Attributes</Label>
                <AttributeTags value={attributes} onChange={setAttributes} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distinguishing_marks">Distinguishing Marks</Label>
                <Textarea
                  id="distinguishing_marks"
                  placeholder="Scars, tattoos, birthmarks, or any unique identifiers..."
                  rows={3}
                  {...register("distinguishing_marks")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clothing_description">Clothing Description</Label>
                <Textarea
                  id="clothing_description"
                  placeholder="What were they wearing when last seen?"
                  rows={3}
                  {...register("clothing_description")}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Location & Photo */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LuMapPin className="h-5 w-5 text-muted-foreground" />
                Location & Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="last_known_location">
                  Last Known Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="last_known_location"
                  placeholder="Area, landmark, or address where they were last seen"
                  {...register("last_known_location")}
                />
                {errors.last_known_location && (
                  <p className="text-sm text-destructive">
                    {errors.last_known_location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Photo (Optional)</Label>
                <ImageDropzone value={photo} onChange={setPhoto} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LuCircleCheck className="h-5 w-5 text-muted-foreground" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">
                      {values.first_name} {values.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium">
                      {values.approximate_age || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium">{values.gender || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {values.last_known_location || "Not provided"}
                    </span>
                  </div>
                  {values.distinguishing_marks && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marks</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {values.distinguishing_marks}
                      </span>
                    </div>
                  )}
                  {Object.keys(attributes).length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Attributes</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(attributes).map(([k, v]) => (
                          <Badge key={k} variant="secondary" className="text-xs">
                            {k}: {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {photo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Photo</span>
                      <span className="font-medium text-green-600">✓ Attached</span>
                    </div>
                  )}
                </div>
              </div>

              {mutation.isError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
                  {mutation.error?.message || "Failed to submit report. Please try again."}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 0}
            className="gap-2"
          >
            <LuArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep} className="gap-2">
              Next
              <LuArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="gap-2 bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/25 hover:brightness-110"
            >
              {mutation.isPending && <LuLoader className="h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
