import { Link } from "react-router-dom";
import { SOCIALS } from "@/lib/constants";

export const Footer = () => (
  <footer className="border-t border-white/10">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p
        className="select-none font-display text-[18vw] font-extrabold uppercase leading-none text-transparent md:text-[10rem]"
        style={{ WebkitTextStroke: "1px rgba(204,255,0,0.25)" }}
      >
        DROXY
      </p>
      <div className="mt-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">© DROXY — Tous droits réservés</p>
        <div className="flex flex-wrap gap-5">
          {SOCIALS.map((s) => (
            <a
              key={s.id}
              data-testid={`footer-social-${s.id}`}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-neon"
            >
              {s.label}
            </a>
          ))}
        </div>
        <Link
          data-testid="admin-access-button"
          to="/admin"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-700 transition-colors hover:text-neon"
        >
          Espace admin
        </Link>
      </div>
    </div>
  </footer>
);
