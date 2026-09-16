import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Bell } from "lucide-react";
import { api } from "@/lib/api";
import { SectionHead } from "@/components/SectionHead";
import { HANDLE } from "@/lib/constants";

export const VideoYouTube = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/youtube/latest")
      .then((r) => setData(r.data))
      .catch(() => setData({ has_video: false, videos: [] }));
  }, []);

  const latest = data?.videos?.[0];

  return (
    <section id="video" data-testid="youtube-section" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHead
        index="05"
        title="La Dernière Vidéo"
        sub="Montages, highlights et gros délires — la dernière sortie YouTube s'affiche ici automatiquement."
      />
      {data === null && <div className="aspect-video w-full animate-pulse rounded-3xl bg-white/5" />}

      {data !== null && data.has_video && latest && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="grid items-center gap-8 lg:grid-cols-[1.4fr_0.6fr]"
        >
          <div className="overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            <iframe
              data-testid="youtube-player"
              src={`https://www.youtube.com/embed/${latest.video_id}`}
              title={latest.title || "Dernière vidéo Droxy"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
            />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-400">Nouveauté YouTube</p>
            <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight">{latest.title || "Dernière vidéo"}</h3>
            <a
              data-testid="youtube-watch-btn"
              href={`https://www.youtube.com/watch?v=${latest.video_id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-transform hover:scale-105"
            >
              <Youtube size={15} /> Regarder sur YouTube
            </a>
          </div>
        </motion.div>
      )}

      {data !== null && !data.has_video && (
        <motion.div
          data-testid="youtube-placeholder"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center sm:p-14"
        >
          <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_120%,rgba(255,77,77,0.12),transparent_70%)]" />
          <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10 text-red-400">
            <Youtube size={30} />
          </span>
          <h3 className="relative mt-6 font-display text-2xl font-extrabold uppercase sm:text-3xl">
            Première vidéo <span className="text-red-400">bientôt</span>
          </h3>
          <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
            La chaîne est prête, les caméras tournent. Dès la première publication, elle s'affichera ici tout
            automatiquement.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              data-testid="youtube-channel-btn"
              href={`https://www.youtube.com/@${HANDLE.youtube}?sub_confirmation=1`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-transform hover:scale-105"
            >
              <Bell size={14} /> S'abonner à la chaîne
            </a>
            <a
              data-testid="youtube-channel-link"
              href={`https://www.youtube.com/@${HANDLE.youtube}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-widest text-slate-300 transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              Voir la chaîne
            </a>
          </div>
        </motion.div>
      )}
    </section>
  );
};
