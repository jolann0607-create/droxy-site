import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { Twitch, Youtube, Instagram, ArrowDown, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { scrollToId } from "@/lib/scroll";
import { IMAGES, HANDLE } from "@/lib/constants";
import { TikTokIcon } from "@/components/TikTokIcon";

const EASE = [0.16, 1, 0.3, 1];
const ACCENTS = {
  droxy: { color: "#CCFF00", soft: "rgba(204,255,0,0.12)", border: "rgba(204,255,0,0.35)" },
  owox: { color: "#9D4EDD", soft: "rgba(157,78,221,0.14)", border: "rgba(157,78,221,0.4)" },
};

const MaskedLine = ({ i, children, className = "" }) => (
  <span className="-mb-1 block overflow-hidden pb-1">
    <motion.span
      className={`block ${className}`}
      initial={{ y: "115%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 0.9, delay: 0.2 + i * 0.15, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

const CHIPS = [
  { Icon: Twitch, label: HANDLE.twitch },
  { Icon: Youtube, label: HANDLE.youtube },
  { Icon: Instagram, label: HANDLE.instagram },
  { Icon: TikTokIcon, label: HANDLE.tiktok },
];

const useLiveStatus = () => {
  const [status, setStatus] = useState(null);
  const stopped = useRef(false);

  useEffect(() => {
    const check = () => {
      if (document.visibilityState === "hidden") return;
      api
        .get("/live")
        .then((r) => !stopped.current && setStatus(r.data))
        .catch(() => {});
    };
    check();
    const t = setInterval(check, 60000);
    return () => {
      stopped.current = true;
      clearInterval(t);
    };
  }, []);

  return status;
};

const LiveBadge = ({ status, accent }) => {
  const isLive = status?.configured && status?.live === true;

  if (isLive) {
    return (
      <>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-red-400">En direct</span>
        {status.title && (
          <span data-testid="live-stream-title" className="max-w-[180px] truncate font-mono text-[10px] text-red-200/80 sm:max-w-[260px]">
            {status.title}
          </span>
        )}
        {status.viewers != null && (
          <span data-testid="live-viewer-count" className="inline-flex items-center gap-1 font-mono text-[10px] text-red-300">
            <Eye size={11} /> {status.viewers}
          </span>
        )}
      </>
    );
  }

  if (status?.configured && status?.live === false) {
    return (
      <>
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-500" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
          Hors ligne — de retour selon l'horaire
        </span>
      </>
    );
  }

  return (
    <>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: accent.color }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent.color }} />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: accent.color }}>
        En stream 5 soirs / semaine
      </span>
    </>
  );
};

const TiltCard = ({ accent }) => {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rX = useSpring(useTransform(my, [0, 1], [9, -9]), { stiffness: 140, damping: 18 });
  const rY = useSpring(useTransform(mx, [0, 1], [-11, 11]), { stiffness: 140, damping: 18 });
  const { scrollY } = useScroll();
  const parY = useTransform(scrollY, [0, 700], [0, 70]);

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.div
      style={{ y: parY }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      className="relative mx-auto w-full max-w-sm lg:max-w-md"
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        style={{ rotateX: rX, rotateY: rY, transformStyle: "preserve-3d" }}
        className="relative rounded-[2rem] border border-white/10 bg-panel/70 p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      >
        <div className="overflow-hidden rounded-3xl">
          <img src={IMAGES.setup} alt="Setup de stream" className="aspect-[4/5] w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-3 rounded-3xl bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
          {CHIPS.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/60 px-3 py-1.5 font-mono text-[10px] tracking-wider text-white backdrop-blur-md"
            >
              <Icon size={12} style={{ color: accent.color }} /> {label}
            </span>
          ))}
        </div>
        <div
          className="absolute right-6 top-6 rounded-full border bg-ink/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] backdrop-blur-md"
          style={{ borderColor: accent.border, color: accent.color }}
        >
          Streams 5/7 soirs
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Hero = ({ persona }) => {
  const status = useLiveStatus();
  const isLive = status?.configured && status?.live === true;
  const accent = ACCENTS[persona] ?? ACCENTS.droxy;

  return (
    <section
      data-testid="hero-container"
      className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:pt-24"
    >
      <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 lg:min-w-fit">
          <motion.div
            data-testid="hero-live-status-badge"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex flex-wrap items-center gap-2.5 rounded-full border px-4 py-1.5"
            style={{
              borderColor: isLive ? "rgba(239,68,68,0.5)" : accent.border,
              backgroundColor: isLive ? "rgba(239,68,68,0.1)" : accent.soft,
            }}
          >
            <LiveBadge status={status} accent={accent} />
          </motion.div>

          <h1
            data-testid="hero-main-title"
            className="font-display font-extrabold uppercase leading-[0.92] tracking-tighter text-[clamp(2.1rem,9vw,5.2rem)]"
          >
            {persona === "owox" ? (
              <>
                <MaskedLine key="o1" i={0}>Streaming,</MaskedLine>
                <MaskedLine key="o2" i={1}>
                  Gaming <span className="text-white/40">&</span>
                </MaskedLine>
                <MaskedLine key="o3" i={2}>
                  <span style={{ color: accent.color }}>Dans le wox.</span>
                </MaskedLine>
              </>
            ) : (
              <>
                <MaskedLine key="d1" i={0}>Streaming,</MaskedLine>
                <MaskedLine key="d2" i={1}>
                  Gaming <span className="text-white/40">&</span>
                </MaskedLine>
                <MaskedLine key="d3" i={2}>
                  <span style={{ color: accent.color }}>Chaos</span> calculé.
                </MaskedLine>
              </>
            )}
          </h1>

          <motion.p
            key={persona}
            data-testid="hero-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-6 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base"
          >
            Bienvenue au QG de <span className="font-semibold" style={{ color: accent.color }}>{persona === "owox" ? "Owox" : "Droxy"}</span>.
            L'horaire des streams, le top donateurs, le top abonnés et tous mes réseaux — réunis au même endroit. Rejoins la
            commu {persona === "owox" ? "WOX" : "MDR"}.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              data-testid="hero-twitch-cta-btn"
              href={`https://twitch.tv/${HANDLE.twitch}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:scale-[1.04]"
              style={{
                backgroundColor: isLive ? "#EF4444" : accent.color,
                color: isLive ? "#FFFFFF" : "#07080D",
                animation: isLive ? "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" : undefined,
              }}
            >
              <Twitch size={15} /> {isLive ? "Rejoindre le direct" : "Regarder sur Twitch"}
            </a>
            <button
              data-testid="hero-schedule-cta-btn"
              onClick={() => scrollToId("#horaire")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-widest text-slate-300 transition-colors hover:border-neon/50 hover:text-neon"
            >
              Voir l'horaire
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500"
          >
            <span>5 soirs / semaine</span>
            <span style={{ color: accent.color }}>✦</span>
            <span>4 plateformes</span>
            <span style={{ color: accent.color }}>✦</span>
            <span>0 script — 100% WOX</span>
          </motion.div>
        </div>

        <TiltCard accent={accent} />
      </div>

      <motion.button
        data-testid="hero-scroll-indicator"
        onClick={() => scrollToId("#horaire")}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-slate-500 hover:text-neon md:block"
      >
        <ArrowDown size={20} />
      </motion.button>
    </section>
  );
};
