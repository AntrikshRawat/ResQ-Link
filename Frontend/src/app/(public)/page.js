import HeroSection from "@/components/home/HeroSection";
import TrackingSearch from "@/components/home/TrackingSearch";
import MetricsTicker from "@/components/home/MetricsTicker";
import HowItWorks from "@/components/home/HowItWorks";

export const metadata = {
  title: "ResQ-Link | Emergency Response — Find Missing Persons",
  description:
    "ResQ-Link connects missing persons with their families through AI-powered matching and real-time coordination between relief camps, hospitals, and helplines.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrackingSearch />
      <MetricsTicker />
      <HowItWorks />
    </>
  );
}
