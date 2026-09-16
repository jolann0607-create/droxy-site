import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Save, Trash2, LogOut, Lock, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";

const TOKEN_KEY = "droxy_token";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-600 focus:border-neon/50";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-full bg-neon px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition-transform hover:scale-105 disabled:opacity-50";
const tabCls = (active) =>
  `rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
    active ? "bg-neon font-bold text-ink" : "border border-white/15 text-slate-400 hover:border-neon/40 hover:text-neon"
  }`;

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [email, setEmail] = useState("admin@droxy.tv");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("schedule");
  const [schedule, setSchedule] = useState([]);
  const [donators, setDonators] = useState([]);
  const [subs, setSubs] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  useEffect(() => {
    if (!token) return;
    Promise.all([api.get("/schedule"), api.get("/donators"), api.get("/subs"), api.get("/feedback")])
      .then(([s, d, x, f]) => {
        setSchedule(s.data);
        setDonators(d.data);
        setSubs(x.data);
        setFeedback(f.data);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          logout();
          toast.error("Session expirée, reconnecte-toi.");
        }
      });
  }, [token]);

  if (!token) {
    const login = async (e) => {
      e.preventDefault();
      try {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        toast.success("Connecté ! Bienvenue chef.");
      } catch (err) {
        toast.error(formatApiError(err));
      }
    };
    return (
      <div data-testid="admin-login-view" className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl border border-white/10 bg-panel/60 p-8 backdrop-blur-xl">
          <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10 text-neon">
            <Lock size={20} />
          </span>
          <h1 className="text-center font-display text-2xl font-extrabold uppercase">Espace Admin</h1>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Réservé à Droxy — accès restreint
          </p>
          <label className="mt-8 block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Email</label>
          <input
            data-testid="admin-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputCls} mt-2`}
            placeholder="admin@droxy.tv"
          />
          <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Mot de passe
          </label>
          <input
            data-testid="admin-passcode-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} mt-2`}
            placeholder="••••••••"
          />
          <button data-testid="admin-login-submit-btn" type="submit" className={`${btnPrimary} mt-6 w-full justify-center`}>
            Se connecter
          </button>
          <Link
            data-testid="admin-back-link"
            to="/"
            className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-neon"
          >
            <ArrowLeft size={12} /> Retour au site
          </Link>
        </form>
      </div>
    );
  }

  const saveSchedule = async () => {
    try {
      await api.put("/schedule", {
        days: schedule.map((d) => ({ day: d.day, hours: d.hours, game: d.game, off: !!d.off })),
      });
      const { data } = await api.get("/schedule");
      setSchedule(data);
      toast.success("Horaire mis à jour !");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const saveDonators = async () => {
    try {
      for (const d of donators) {
        const payload = {
          name: d.name || "Sans nom",
          amount_total: Number(d.amount_total) || 0,
          amount_month: Number(d.amount_month) || 0,
        };
        if (d._new) await api.post("/donators", payload);
        else await api.put(`/donators/${d.id}`, payload);
      }
      const { data } = await api.get("/donators");
      setDonators(data);
      toast.success("Top donateurs enregistré !");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const saveSubs = async () => {
    try {
      for (const s of subs) {
        const payload = {
          name: s.name || "Sans nom",
          tier: Number(s.tier) || 1,
          months: Number(s.months) || 0,
          gifts: Number(s.gifts) || 0,
        };
        if (s._new) await api.post("/subs", payload);
        else await api.put(`/subs/${s.id}`, payload);
      }
      const { data } = await api.get("/subs");
      setSubs(data);
      toast.success("Top abonnés enregistré !");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const deleteFeedback = async (f) => {
    try {
      await api.delete(`/feedback/${f.id}`);
      setFeedback((fs) => fs.filter((x) => x.id !== f.id));
      toast.success("Message supprimé.");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div data-testid="admin-control-modal" className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold uppercase">
          Espace <span className="text-neon">Admin</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link data-testid="admin-back-site-link" to="/" className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-neon">
            ← Voir le site
          </Link>
          <button data-testid="admin-logout-btn" onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-400 hover:border-red-500/50 hover:text-red-400">
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button data-testid="admin-edit-schedule-btn" className={tabCls(tab === "schedule")} onClick={() => setTab("schedule")}>
          Horaire
        </button>
        <button data-testid="admin-tab-donators" className={tabCls(tab === "donators")} onClick={() => setTab("donators")}>
          Donateurs
        </button>
        <button data-testid="admin-tab-subs" className={tabCls(tab === "subs")} onClick={() => setTab("subs")}>
          Abonnés
        </button>
        <button data-testid="admin-tab-feedback" className={tabCls(tab === "feedback")} onClick={() => setTab("feedback")}>
          <span className="inline-flex items-center gap-2">
            <MessageSquare size={12} /> Commentaires
          </span>
        </button>
      </div>

      {tab === "schedule" && (
        <div className="mt-8 space-y-3">
          {schedule.map((d, i) => (
            <div key={d.id || i} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="w-24 font-display text-sm font-bold uppercase">{d.day}</span>
              <input
                data-testid={`admin-schedule-hours-${i}`}
                value={d.hours}
                onChange={(e) => setSchedule((ds) => ds.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)))}
                className={`${inputCls} flex-1 min-w-[110px]`}
                placeholder="19h — 23h"
              />
              <input
                data-testid={`admin-schedule-game-${i}`}
                value={d.game}
                onChange={(e) => setSchedule((ds) => ds.map((x, j) => (j === i ? { ...x, game: e.target.value } : x)))}
                className={`${inputCls} flex-1 min-w-[110px]`}
                placeholder="Jeu / Ambiance"
              />
              <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                <input
                  data-testid={`admin-schedule-off-${i}`}
                  type="checkbox"
                  checked={!!d.off}
                  onChange={(e) => setSchedule((ds) => ds.map((x, j) => (j === i ? { ...x, off: e.target.checked } : x)))}
                  className="h-4 w-4 accent-[#CCFF00]"
                />
                Repos
              </label>
            </div>
          ))}
          <button data-testid="admin-save-changes-btn" onClick={saveSchedule} className={btnPrimary}>
            <Save size={14} /> Enregistrer l'horaire
          </button>
        </div>
      )}

      {tab === "donators" && (
        <div className="mt-8 space-y-3">
          {donators.map((d, i) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="w-8 font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
              <input
                data-testid={`admin-donator-name-${i}`}
                value={d.name}
                onChange={(e) => setDonators((ds) => ds.map((x) => (x.id === d.id ? { ...x, name: e.target.value } : x)))}
                className={`${inputCls} flex-1 min-w-[120px]`}
                placeholder="Pseudo"
              />
              <input
                data-testid={`admin-donator-total-${i}`}
                type="number"
                value={d.amount_total}
                onChange={(e) => setDonators((ds) => ds.map((x) => (x.id === d.id ? { ...x, amount_total: e.target.value } : x)))}
                className={`${inputCls} w-28`}
                placeholder="Total €"
              />
              <input
                data-testid={`admin-donator-month-${i}`}
                type="number"
                value={d.amount_month}
                onChange={(e) => setDonators((ds) => ds.map((x) => (x.id === d.id ? { ...x, amount_month: e.target.value } : x)))}
                className={`${inputCls} w-28`}
                placeholder="Mois €"
              />
              <button
                data-testid={`admin-donator-delete-${i}`}
                onClick={async () => {
                  if (!d._new) await api.delete(`/donators/${d.id}`).catch((e) => toast.error(formatApiError(e)));
                  setDonators((ds) => ds.filter((x) => x.id !== d.id));
                }}
                className="rounded-lg border border-white/10 p-2 text-slate-500 transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              data-testid="admin-add-donator-btn"
              onClick={() => setDonators((ds) => [...ds, { id: `new-${Date.now()}`, _new: true, name: "", amount_total: 0, amount_month: 0 }])}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-slate-300 hover:border-neon/40 hover:text-neon"
            >
              <Plus size={14} /> Ajouter
            </button>
            <button data-testid="admin-save-donators-btn" onClick={saveDonators} className={btnPrimary}>
              <Save size={14} /> Enregistrer
            </button>
          </div>
        </div>
      )}

      {tab === "subs" && (
        <div className="mt-8 space-y-3">
          {subs.map((s, i) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="w-8 font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
              <input
                data-testid={`admin-sub-name-${i}`}
                value={s.name}
                onChange={(e) => setSubs((xs) => xs.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
                className={`${inputCls} flex-1 min-w-[120px]`}
                placeholder="Pseudo"
              />
              <select
                data-testid={`admin-sub-tier-${i}`}
                value={s.tier}
                onChange={(e) => setSubs((xs) => xs.map((x) => (x.id === s.id ? { ...x, tier: Number(e.target.value) } : x)))}
                className={`${inputCls} w-28 [&>option]:bg-ink`}
              >
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
              </select>
              <input
                data-testid={`admin-sub-months-${i}`}
                type="number"
                value={s.months}
                onChange={(e) => setSubs((xs) => xs.map((x) => (x.id === s.id ? { ...x, months: e.target.value } : x)))}
                className={`${inputCls} w-24`}
                placeholder="Mois"
              />
              <input
                data-testid={`admin-sub-gifts-${i}`}
                type="number"
                value={s.gifts}
                onChange={(e) => setSubs((xs) => xs.map((x) => (x.id === s.id ? { ...x, gifts: e.target.value } : x)))}
                className={`${inputCls} w-24`}
                placeholder="Gifts"
              />
              <button
                data-testid={`admin-sub-delete-${i}`}
                onClick={async () => {
                  if (!s._new) await api.delete(`/subs/${s.id}`).catch((e) => toast.error(formatApiError(e)));
                  setSubs((xs) => xs.filter((x) => x.id !== s.id));
                }}
                className="rounded-lg border border-white/10 p-2 text-slate-500 transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              data-testid="admin-add-sub-btn"
              onClick={() => setSubs((xs) => [...xs, { id: `new-${Date.now()}`, _new: true, name: "", tier: 1, months: 0, gifts: 0 }])}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-slate-300 hover:border-neon/40 hover:text-neon"
            >
              <Plus size={14} /> Ajouter
            </button>
            <button data-testid="admin-save-subs-btn" onClick={saveSubs} className={btnPrimary}>
              <Save size={14} /> Enregistrer
            </button>
          </div>
        </div>
      )}

      {tab === "feedback" && (
        <div className="mt-8 space-y-3">
          {feedback.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center font-mono text-xs uppercase tracking-widest text-slate-500">
              Aucun message pour le moment — les suggestions des viewers apparaîtront ici
            </p>
          )}
          {feedback.map((f, i) => (
            <div key={f.id} data-testid="admin-feedback-row" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-8 font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate font-semibold">{f.name}</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {f.created_at ? new Date(f.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
                  </span>
                </div>
                <button
                  data-testid={`admin-feedback-delete-${i}`}
                  onClick={() => deleteFeedback(f)}
                  className="rounded-lg border border-white/10 p-2 text-slate-500 transition-colors hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="mt-3 pl-11 text-sm leading-relaxed text-slate-300">{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
