import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Search } from "lucide-react";
import { api } from "@/lib/api";
import { SectionHead } from "@/components/SectionHead";

const TIERS = {
  1: { label: "Tier 1", color: "#9D4EDD" },
  2: { label: "Tier 2", color: "#00F0FF" },
  3: { label: "Tier 3", color: "#FFD700" },
};

export const Subs = () => {
  const [subs, setSubs] = useState([]);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("all");

  useEffect(() => {
    api
      .get("/subs")
      .then((r) => setSubs(r.data))
      .catch(() => setSubs([]));
  }, []);

  const filtered = useMemo(
    () =>
      subs
        .filter((s) => (tier === "all" ? true : s.tier === Number(tier)))
        .filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
        .sort((a, b) => b.months - a.months || b.gifts - a.gifts),
    [subs, query, tier],
  );

  return (
    <section id="subs" data-testid="subs-leaderboard-section" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHead
        index="03"
        title="Top Abonnés"
        sub="Les OG de la commu : streak de mois, subs offerts, fidélité. Respect total."
      />
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            data-testid="subs-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un pseudo…"
            className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-slate-600 focus:border-neon/50"
          />
        </div>
        <select
          data-testid="subs-tier-filter-select"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 font-mono text-xs uppercase tracking-widest outline-none transition-colors focus:border-neon/50 [&>option]:bg-ink"
        >
          <option value="all">Tous les tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:ml-auto">
          {filtered.length} abonné{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10">
        {filtered.length === 0 && (
          <p className="p-10 text-center font-mono text-xs uppercase tracking-widest text-slate-500">
            {subs.length === 0
              ? "Aucun abonné pour le moment — les premiers seront des légendes"
              : "Aucun abonné trouvé — essaie un autre pseudo"}
          </p>
        )}
        {filtered.map((s, i) => {
          const t = TIERS[s.tier] ?? TIERS[1];
          return (
            <motion.div
              key={s.id}
              data-testid="sub-list-item-row"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
              className={`flex items-center gap-3 bg-white/[0.03] px-4 py-4 transition-colors hover:bg-white/[0.06] sm:gap-4 sm:px-6 ${
                i > 0 ? "border-t border-white/5" : ""
              }`}
            >
              <span className="w-8 font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 truncate font-semibold">{s.name}</span>
              <span
                className="hidden rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-widest sm:inline-flex"
                style={{ color: t.color, borderColor: `${t.color}55`, background: `${t.color}14` }}
              >
                {t.label}
              </span>
              <span className="hidden font-mono text-xs text-slate-400 md:inline">{s.months} mois de streak</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400">
                <Gift size={13} className="text-ultra" /> {s.gifts}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
