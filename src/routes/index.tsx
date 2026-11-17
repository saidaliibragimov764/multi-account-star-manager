import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
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

function Index() {
  useEffect(() => {
    const tg = (
      window as unknown as { Telegram?: { WebApp?: { ready: () => void; expand: () => void } } }
    ).Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
  }, []);

  return <Dashboard />;
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
    const normalizedPhone = v.phone.replace(/[\s()-]/g, "");
    if (accounts.some((account) => account.phone.replace(/[\s()-]/g, "") === normalizedPhone)) {
      toast.error("Bu telefon raqami allaqachon qo'shilgan");
      return;
    }
    const created = createAccount({ ...v, phone: normalizedPhone });
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-28 pt-5">
      <header className="glass-card mb-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Joriy vaqt</p>
            <p className="text-2xl font-bold tabular-nums">{clock.toLocaleTimeString("uz-UZ")}</p>
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

      <section className="glass-card mb-5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Vazifalar manbai</p>
            <h2 className="mt-1 font-semibold">@patrickstarsrobot</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Vazifalarni botning o'zida bajaring. Ulanish va Stars statistikasi hozircha
              sozlanmagan.
            </p>
          </div>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-muted-foreground">
            Ulanmagan
          </span>
        </div>
        <a
          href="https://t.me/patrickstarsrobot"
          target="_blank"
          rel="noreferrer"
          className="gift-button mt-3 block rounded-xl px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
        >
          Vazifalar botini ochish ↗
        </a>
      </section>

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
        {accounts.length === 0 && (
          <div className="glass-card p-5 text-center">
            <p className="font-medium">Hali akkaunt qo'shilmagan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Akkaunt qo'shish tugmasi hozircha brauzerda demo yozuv yaratadi, Telegramga kirmaydi.
            </p>
          </div>
        )}
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
        <a
          href="https://t.me/patrickstarsrobot"
          target="_blank"
          rel="noreferrer"
          className="gift-button block w-full rounded-2xl py-4 text-center text-base font-bold text-primary-foreground hover:opacity-95"
        >
          ✨ @patrickstarsrobot’ni ochish
        </a>
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
        <p className="mt-1 text-xs text-muted-foreground">
          Hozircha ma'lumotlar faqat ushbu brauzerda saqlanadi; Telegram tasdiqlash kodi
          yuborilmaydi.
        </p>
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
            type="tel"
            autoComplete="tel"
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
