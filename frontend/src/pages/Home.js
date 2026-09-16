import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Schedule } from "@/components/Schedule";
import { Donators } from "@/components/Donators";
import { Subs } from "@/components/Subs";
import { Socials } from "@/components/Socials";
import { VideoYouTube } from "@/components/VideoYouTube";
import { Feedback } from "@/components/Feedback";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [persona, setPersona] = useState("droxy");

  useEffect(() => {
    document.title = persona === "owox" ? "OWOX — Streamer" : "DROXY — Streamer";
  }, [persona]);

  return (
    <div id="top" data-testid="home-page" className="relative overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-ultra/20 blur-[140px]" />
        <div className="absolute -left-40 top-1/2 h-[500px] w-[500px] rounded-full bg-cyanx/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[600px] rounded-full bg-neon/10 blur-[140px]" />
      </div>
      <Nav persona={persona} onTogglePersona={() => setPersona((p) => (p === "droxy" ? "owox" : "droxy"))} />
      <main className="relative z-10">
        <Hero persona={persona} />
        <Marquee />
        <Schedule />
        <Donators />
        <Subs />
        <Socials />
        <VideoYouTube />
        <Feedback />
      </main>
      <Footer />
    </div>
  );
}
