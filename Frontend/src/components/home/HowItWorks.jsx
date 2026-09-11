import { Card, CardContent } from "@/components/ui/card";
import { LuFileText, LuCpu, LuCircleCheck } from "react-icons/lu";

const steps = [
  {
    icon: LuFileText,
    title: "1. File a Report",
    description:
      "Submit details and photos of a missing or rescued person through our simple intake form. You'll receive a tracking code instantly.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: LuCpu,
    title: "2. AI Matching",
    description:
      "Our AI engine cross-references facial features, names, and physical descriptions across all reports to find potential matches.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: LuCircleCheck,
    title: "3. Human Verification",
    description:
      "Trained staff review AI-generated matches on the triage console, verifying identities before notifying families of confirmed locations.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">How It Works</h2>
          <p className="mt-3 text-muted-foreground">
            A seamless pipeline from report to reunion, powered by AI and
            verified by humans.
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.title}
                className={`relative border-${step.borderColor} bg-card/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <CardContent className="flex flex-col items-center p-6 text-center sm:p-8">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bgColor} ring-4 ring-background`}
                  >
                    <Icon className={`h-7 w-7 ${step.color}`} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
