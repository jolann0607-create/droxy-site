import { useState } from "react";
import { motion } from "framer-motion";
import { Twitch, Menu, X } from "lucide-react";
import { scrollToId } from "@/lib/scroll";
import { HANDLE } from "@/lib/constants";

const LINKS = [
  { id: "#horaire", label: "Horaire" },
  { id: "#dons", label: "Dons" },
  { id: "#subs", label: "Subs" },
  { id: "#video", label: "Vidéo" },
  { id: "#avis", label: "Avis" },
  { id: "#reseaux", label: "Réseaux" },
];

export const Nav = ({ persona, onTogglePersona }) => {
  const [open, setOpen] = useState(false);
  const isOwox = persona === "owox";

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-[#07080D]/70 px-4 py-3 backdrop-blur-xl">
          <button
            data-testid="nav-logo"
            onClick={(e) => {
              onTogglePersona();
              go(e, "#top");
            }}
            title="Il y a un autre visage…"
            className="font-display text-lg font-extrabold tracking-tight"
          >
            {isOwox ? (
              <>
                OWOX<span style={{ color: "#9D4EDD" }}>.</span>
              </>
            ) : (
              <>
                DROXY<span className="text-neon">_</span>MDR
              </>
            )}
          </button>
          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={l.id}
                data-testid={`nav-link-${l.id.slice(1)}`}
                onClick={(e) => go(e, l.id)}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-neon"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              data-testid="nav-twitch-btn"
              href={`https://twitch.tv/${HANDLE.twitch}`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full bg-neon px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition-transform hover:scale-105 sm:inline-flex"
            >
              <Twitch size={14} /> Twitch
            </a>
            <button data-testid="nav-menu-btn" className="p-2 md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#07080D]/95 p-4 backdrop-blur-xl md:hidden"
          >
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={l.id}
                onClick={(e) => go(e, l.id)}
                className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300"
              >
                {l.label}
              </a>
            ))}
          </motion.nav>
        )}
      </div>
    </header>
  );
};
