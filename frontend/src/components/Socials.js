import { motion } from "framer-motion";
import { Twitch, Youtube, Instagram, ArrowUpRight } from "lucide-react";
import { SOCIALS } from "@/lib/constants";
import { TikTokIcon } from "@/components/TikTokIcon";
import { SectionHead } from "@/components/SectionHead";

const ICONS = { twitch: Twitch, youtube: Youtube, instagram: Instagram, tiktok: TikTokIcon };

export const Socials = () => (
  <section id="reseaux" data-testid="socials-section" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
    <SectionHead
      index="04"
      title="Retrouve-moi"
      sub="Quatre plateformes, un seul cerveau. Abonne-toi partout pour ne rien rater."
    />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SOCIALS.map((s, i) => {
        const Icon = ICONS[s.id];
        return (
          <motion.a
            key={s.id}
            data-testid={`social-card-${s.id}`}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-transform duration-300 hover:-translate-y-2"
          >
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `radial-gradient(120% 90% at 50% 110%, ${s.color}26, transparent 60%)` }}
            />
            <div className="relative flex items-start justify-between">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10"
                style={{ color: s.color }}
              >
                <Icon size={22} />
              </span>
              <ArrowUpRight
                size={18}
                className="text-slate-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
              />
            </div>
            <h3 className="relative mt-8 font-display text-xl font-bold uppercase">{s.label}</h3>
            <p className="relative font-mono text-xs text-slate-400">{s.handle}</p>
            <p className="relative mt-4 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: s.color }}>
              {s.tag}
            </p>
          </motion.a>
        );
      })}
    </div>
  </section>
);
