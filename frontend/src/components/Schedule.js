import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { SectionHead } from "@/components/SectionHead";

const ORDER = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const Schedule = () => {
  const [days, setDays] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    setDays(null);
    api
      .get("/schedule")
      .then((r) => setDays(r.data))
      .catch(() => {
        setDays([]);
        setFailed(true);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const today = ORDER[(new Date().getDay() + 6) % 7];

  return (
    <section id="horaire" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHead
        index="01"
        title="L'Horaire de stream"
        sub="Cinq soirs par semaine. Mardi et jeudi : repos."
      />
      {failed && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-red-400">
            Impossible de charger l'horaire — vérifie ta connexion
          </p>
          <button
            data-testid="schedule-retry-btn"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full bg-neon px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink"
          >
            <RefreshCw size={13} /> Réessayer
          </button>
        </div>
      )}
      <div
        data-testid="schedule-container"
        className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7"
      >
        {days === null &&
          [...Array(7)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/5" />
          ))}
        {days &&
          !failed &&
          days.map((d, i) => {
            const isToday = d.day === today;
            return (
              <motion.div
                key={d.id || i}
                data-testid="schedule-day-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.4) }}
                className={`relative flex min-h-[180px] flex-col rounded-2xl border p-4 ${
                  isToday ? "border-neon/60 bg-neon/10" : "border-white/10 bg-white/[0.03]"
                } ${d.off ? "opacity-60" : ""} ${i === 6 ? "col-span-2 md:col-span-1" : ""}`}
              >
                {isToday && (
                  <span
                    data-testid="schedule-today-highlight"
                    className="absolute -top-2.5 right-3 rounded-full bg-neon px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ink"
                  >
                    Aujourd'hui
                  </span>
                )}
                <p className={`font-mono text-[10px] uppercase tracking-[0.25em] ${isToday ? "text-neon" : "text-slate-500"}`}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold uppercase">{d.day}</h3>
                <div className="mt-auto">
                  {d.off ? (
                    <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Repos</p>
                  ) : (
                    <>
                      <p className="font-mono text-sm font-bold text-neon">{d.hours}</p>
                      <p className="mt-1 text-xs text-slate-400">{d.game}</p>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
      </div>
      {days && !failed && days.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center font-mono text-xs uppercase tracking-widest text-slate-500">
          Horaire pas encore publié — reviens bientôt
        </p>
      )}
    </section>
  );
};
