import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ACCESS_CODE,
  AUTH_KEY,
  createAccount,
  fmt,
  loadAccounts,
  maskPhone,
  saveAccounts,
  totals,
  type Account,
} from "@/lib/accounts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Starts Manager — Telegram akkauntlar paneli" },
      {
        name: "description",
        content:
          "Bir nechta Telegram akkauntlarning starts statistikasini kuzating va barcha startslarni asosiy akkauntga yuboring.",
      },
      { property: "og:title", content: "Starts Manager — Telegram akkauntlar paneli" },
      {
        property: "og:description",
        content: "Akkauntlar statistikasi, tarix va startslarni bir tugma bilan yig'ish.",
      },
    ],
  }),
  component: Index,
});

function Confetti({ run }: { run: number }) {
  if (!run) return null;
  const colors = ["#7b2ff7", "#f107a3", "#ffb830", "#3ddc97", "#4cc9f0"];
  return (
    <>
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={`${run}-${i}`}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.6}s`,
          }}
        />
      ))}
    </>
  );
}

function Index() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    setReady(true);
    const tg = (window as unknown as { Telegram?: { WebApp?: { ready: () => void; expand: () => void } } })
      .Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
  }, []);

  if (!ready) return null;
  return authed ? <Dashboard /> : <Login onSuccess={() => setAuthed(true)} />;
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      localStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } else {
      setError("Kod noto'g'ri. Qayta urinib ko'ring.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="glass-card w-full max-w-sm p-7 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full gift-button text-2xl">
          🔐
        </div>
        <h1 className="text-2xl font-bold">Kodni kiriting</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Panelga kirish uchun maxfiy kodni yozing
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="••••••••"
          className="mt-6 w-full rounded-xl border border-input bg-secondary/60 px-4 py-3 text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-ring"
        />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          className="gift-button mt-5 w-full rounded-xl py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
        >
          Kirish
        </button>
      </form>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-star">{fmt(value)}</p>
    </div>
  );
}

function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [clock, setClock] = useState(new Date());
  const [confetti, setConfetti] = useState(0);
  const [online, setOnline] = useState(true);
  const [adding, setAdding] = useState(false);
  const sums = useMemo(() => totals(accounts), [accounts]);
  const main = accounts.find((a) => a.is_main);

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    const r = setInterval(() => setAccounts((a) => [...a]), 30000);
    const up = () => setOnline(true);
    const down = () => {
      setOnline(false);
      toast.error("Internet uzildi — ma'lumotlar yangilanmayapti");
    };
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      clearInterval(t);
      clearInterval(r);
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  const addAccount = (v: { name: string; username: string; phone: string; is_main: boolean }) => {
    const created = createAccount(v);
    setAccounts((prev) => [
      ...(created.is_main ? prev.map((a) => ({ ...a, is_main: false })) : prev),
      created,
    ]);
    setAdding(false);
    toast.success(`@${created.username} qo'shildi`);
  };

  const removeAccount = (id: number) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast("Akkaunt o'chirildi");
  };


  const sendAll = () => {
    const moved = accounts.filter((a) => !a.is_main).reduce((s, a) => s + a.stats.today, 0);
    if (moved <= 0) {
      toast("Yuboriladigan starts yo'q");
      return;
    }
    setAccounts((prev) =>
      prev.map((a) =>
        a.is_main
          ? { ...a, stats: { ...a.stats, today: a.stats.today + moved } }
          : { ...a, stats: { ...a.stats, today: 0 } },
      ),
    );
    setConfetti(Date.now());
    toast.success(`🎁 ${fmt(moved)} starts @${main.username} akkauntiga yuborildi`);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-28 pt-5">
      <Confetti run={confetti} />
      <header className="glass-card mb-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Joriy vaqt</p>
            <p className="text-2xl font-bold tabular-nums">
              {clock.toLocaleTimeString("uz-UZ")}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              online ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
            }`}
          >
            {online ? "Onlayn" : "Oflayn"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatBox label="Bugun" value={sums.today} />
          <StatBox label="Hafta" value={sums.week} />
          <StatBox label="Oy" value={sums.month} />
          <StatBox label="Barchasi" value={sums.total} />
        </div>
      </header>

      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Akkauntlar ({accounts.length})
        </h2>
        <button
          onClick={() => setAdding(true)}
          className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/70"
        >
          + Akkaunt qo'shish
        </button>
      </div>
      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="relative">
            <Link
              to="/account/$id"
              params={{ id: String(a.id) }}
              className={`card-tap glass-card block p-4 hover:-translate-y-0.5 hover:shadow-lg ${
                a.is_main ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        a.online ? "bg-success" : "bg-destructive"
                      }`}
                    />
                    <p className="truncate font-semibold">{a.name}</p>
                    {a.is_main && (
                      <span className="rounded-full bg-primary/25 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        ⭐ Asosiy
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-accent">@{a.username}</p>
                  <p className="text-xs text-muted-foreground">{maskPhone(a.phone)}</p>
                </div>
                <div className="mr-8 text-right">
                  <p className="text-xs text-muted-foreground">Bugun</p>
                  <p className="text-xl font-bold text-star">{fmt(a.stats.today)}</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => removeAccount(a.id)}
              aria-label="O'chirish"
              className="absolute right-2 top-2 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-lg px-4 pb-4">
        <button
          onClick={sendAll}
          className="gift-button w-full rounded-2xl py-4 text-base font-bold text-primary-foreground hover:opacity-95"
        >
          🎁 Barcha startslarni {main ? `@${main.username} ga` : "asosiy akkauntga"} yuborish ✨
        </button>
      </div>

      {adding && <AddAccountModal onClose={() => setAdding(false)} onAdd={addAccount} />}
    </main>
  );
}

function AddAccountModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (v: { name: string; username: string; phone: string; is_main: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [isMain, setIsMain] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Ismni to'liq kiriting");
    const u = username.trim().replace(/^@/, "");
    if (!/^[A-Za-z0-9_]{3,32}$/.test(u)) return setError("Username 3-32 ta harf/raqam bo'lsin");
    if (!/^\+?[0-9 ()-]{7,20}$/.test(phone.trim())) return setError("Telefon raqami noto'g'ri");
    onAdd({ name, username: u, phone, is_main: isMain });
  };

  const field =
    "mt-1 w-full rounded-xl border border-input bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <form onSubmit={submit} className="glass-card w-full max-w-sm p-5">
        <h3 className="text-lg font-bold">Yangi akkaunt</h3>
        <label className="mt-4 block text-xs text-muted-foreground">
          To'liq ism
          <input
            className={field}
            value={name}
            maxLength={60}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Aziz Karimov"
          />
        </label>
        <label className="mt-3 block text-xs text-muted-foreground">
          Username
          <input
            className={field}
            value={username}
            maxLength={33}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            placeholder="@username"
          />
        </label>
        <label className="mt-3 block text-xs text-muted-foreground">
          Telefon raqami
          <input
            className={field}
            value={phone}
            maxLength={20}
            inputMode="tel"
            onChange={(e) => {
              setPhone(e.target.value);
              setError("");
            }}
            placeholder="+998 90 123 45 67"
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isMain}
            onChange={(e) => setIsMain(e.target.checked)}
            className="h-4 w-4 accent-[oklch(0.62_0.19_295)]"
          />
          Asosiy akkaunt sifatida belgilash
        </label>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-secondary py-3 text-sm font-medium"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="gift-button flex-1 rounded-xl py-3 text-sm font-semibold text-primary-foreground"
          >
            Qo'shish
          </button>
        </div>
      </form>
    </div>
  );
}

