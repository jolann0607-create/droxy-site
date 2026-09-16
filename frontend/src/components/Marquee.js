const ITEMS = [
  "DROXY_MDR",
  "TOP DONATEURS",
  "TOP ABONNÉS",
  "HORAIRE DE STREAM",
  "COMMU MDR",
  "100% EN DIRECT",
  "REJOINS LE CLUB",
];

export const Marquee = () => (
  <div
    data-testid="editorial-marquee-container"
    className="relative my-4 overflow-hidden border-y border-white/10 py-5"
  >
    <div className="animate-marquee flex w-max gap-10">
      {[0, 1].map((copy) => (
        <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-10">
          {ITEMS.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-10 font-display text-2xl font-extrabold uppercase tracking-tight text-white/25 md:text-3xl"
            >
              {item} <span className="text-neon">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);
