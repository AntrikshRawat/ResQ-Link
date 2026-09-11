"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LuLoader } from "react-icons/lu";

export default function MyReportsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/citizen/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <LuLoader className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
