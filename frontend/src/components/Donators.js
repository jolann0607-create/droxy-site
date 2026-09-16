import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { api } from "@/lib/api";
import { SectionHead } from "@/components/SectionHead";

const eur = (n) =>
  (Number(n) || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const MEDALS = { 1: { ring: "#FFD700", name: "Or" }, 2: { ring: "#C0C0C0", name: "Argent" }, 3: { ring: "#CD7F32", name: "Bronze" } };

const PodiumCard = ({ donator, rank, amount, delay }) => {
  const medal = MEDALS[rank];
  const height = { 1: "h-56 md:h-64", 2: "h-44 md:h-52", 3: "h-36 md:h-40" }[rank];
  return (
    <motion.div
      data-testid={`donator-podium-rank-${rank}`}
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay }}
      className={`relative flex ${height} flex-1 flex-col items-center justify-end overflow-hidden rounded-3xl border bg-white/[0.03] p-5`}
      style={{ borderColor: `${medal.ring}55`, boxShadow: `0 0 60px -10px ${medal.ring}40` }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 80% at 50% 120%, ${medal.ring}22, transparent 65%)` }}
      />
      {rank === 1 && (
        <Crown size={22} className="absolute left-1/2 top-4 -translate-x-1/2" style={{ color: medal.ring }} />
      )}
      <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: medal.ring }}>
        {medal.name}
      </span>
      <span className="mt-1 font-display text-4xl font-extrabold md:text-5xl" style={{ color: medal.ring }}>
        {rank}
      </span>
      <p className="mt-2 max-w-full truncate px-2 font-display text-lg font-bold md:text-xl">{donator.name}</p>
      <p className="font-mono text-sm text-neon">{eur(amount)}</p>
    </motion.div>
  );
};

export const Donators = () => {
  const [donators, setDonators] = useState([]);
  const [period, setPeriod] = useState("total");

  useEffect(() => {
    api
      .get("/donators")
      .then((r) => setDonators(r.data))
      .catch(() => setDonators([]));
  }, []);

  const sorted = useMemo(
    () =>
      [...donators].sort((a, b) =>
        period === "month" ? b.amount_month - a.amount_month : b.amount_total - a.amount_total,
      ),
    [donators, period],
  );
  const metric = (d) => (period === "month" ? d.amount_month : d.amount_total);
  const [first, second, third] = sorted;

  return (
    <section id="dons" data-testid="donators-leaderboard-section" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHead
        index="02"
        title="Top Donateurs"
        sub="Ceux qui font tourner le stream. Légendes éternelles de la commu MDR."
      />
      <div className="mb-10 flex gap-2">
        <button
          data-testid="donators-filter-monthly"
          onClick={() => setPeriod("month")}
          className={`rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
            period === "month"
              ? "bg-neon font-bold text-ink"
              : "border border-white/15 text-slate-400 hover:border-neon/40 hover:text-neon"
          }`}
        >
          Ce mois
        </button>
        <button
          data-testid="donators-filter-alltime"
          onClick={() => setPeriod("total")}
          className={`rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
            period === "total"
              ? "bg-neon font-bold text-ink"
              : "border border-white/15 text-slate-400 hover:border-neon/40 hover:text-neon"
          }`}
        >
          Général
        </button>
      </div>

      <div className="flex items-end justify-center gap-3 md:gap-5">
        {second && <PodiumCard donator={second} rank={2} amount={metric(second)} delay={0.15} />}
        {first && <PodiumCard donator={first} rank={1} amount={metric(first)} delay={0} />}
        {third && <PodiumCard donator={third} rank={3} amount={metric(third)} delay={0.3} />}
      </div>

      {sorted.length > 3 && (
        <div className="mt-10 space-y-2">
          {sorted.slice(3).map((d, i) => (
            <motion.div
              key={d.id}
              data-testid="donator-list-row"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.35) }}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 transition-colors hover:border-neon/40"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="w-7 font-mono text-xs text-slate-500">{String(i + 4).padStart(2, "0")}</span>
                <span className="truncate font-semibold">{d.name}</span>
              </div>
              <span className="font-mono text-sm text-neon">{eur(metric(d))}</span>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
