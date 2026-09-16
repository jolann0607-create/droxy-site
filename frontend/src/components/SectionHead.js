import { motion } from "framer-motion";

export const SectionHead = ({ index, title, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6 }}
    className="mb-10 md:mb-14"
  >
    <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-neon">{index} //</p>
    <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl lg:text-5xl">
      {title}
    </h2>
    {sub ? (
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">{sub}</p>
    ) : null}
  </motion.div>
);
