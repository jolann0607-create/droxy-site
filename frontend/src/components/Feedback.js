import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { SectionHead } from "@/components/SectionHead";

export const Feedback = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 3) {
      toast.error("Écris au moins quelques mots avant d'envoyer.");
      return;
    }
    setSending(true);
    try {
      await api.post("/feedback", { name: name.trim() || "Anonyme", message: message.trim() });
      setName("");
      setMessage("");
      toast.success("Message envoyé ! Merci pour ton aide.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="avis" data-testid="feedback-section" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHead
        index="06"
        title="La Boîte à Idées"
        sub="Un jeu à tester ? Un truc à améliorer sur les streams ou sur le site ? Balance ton idée — tout est lu, promis."
      />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon/30 bg-neon/10 text-neon">
          <MessageSquare size={18} />
        </span>
        <label className="mt-6 block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Ton pseudo (optionnel)
        </label>
        <input
          data-testid="feedback-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          placeholder="Ex : Kyzo"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-600 focus:border-neon/50"
        />
        <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Ton idée / ton commentaire
        </label>
        <textarea
          data-testid="feedback-message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Ex : refais un tournoi Valorant commu, et mets l'horaire en horaire de Paris…"
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-600 focus:border-neon/50"
        />
        <button
          data-testid="feedback-submit-btn"
          type="submit"
          disabled={sending}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:scale-[1.04] disabled:opacity-50"
        >
          <Send size={14} /> {sending ? "Envoi…" : "Envoyer"}
        </button>
      </motion.form>
    </section>
  );
};
