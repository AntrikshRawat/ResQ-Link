import Link from "next/link";
import { LuShield, LuPhone, LuMail } from "react-icons/lu";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                <LuShield className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold">
                Res<span className="text-red-500">Q</span>-Link
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time emergency response coordination platform. Connecting
              missing persons with their families through AI-powered matching.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/report/missing" className="transition-colors hover:text-foreground">
                  Report Missing Person
                </Link>
              </li>
              <li>
                <Link href="/report/rescued" className="transition-colors hover:text-foreground">
                  Report Rescued Person
                </Link>
              </li>
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Track a Report
                </Link>
              </li>
            </ul>
          </div>

          {/* For Staff */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Staff Access</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/triage" className="transition-colors hover:text-foreground">
                  Triage Console
                </Link>
              </li>
              <li>
                <Link href="/dashboard/records" className="transition-colors hover:text-foreground">
                  Records Registry
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Emergency Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a
                href="tel:112"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <LuPhone className="h-4 w-4 text-red-500" />
                Emergency: 112
              </a>
              <a
                href="mailto:help@resqlink.org"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <LuMail className="h-4 w-4 text-red-500" />
                help@resqlink.org
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ResQ-Link. All rights reserved.</p>
          <p>Built with purpose. Every second counts.</p>
        </div>
      </div>
    </footer>
  );
}
