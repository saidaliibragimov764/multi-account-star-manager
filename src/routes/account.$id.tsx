import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  loadAccounts,
  saveAccounts,
  fmt,
  fmtDate,
  maskPhone,
  type HistoryItem,
} from "@/lib/accounts";

export const Route = createFileRoute("/account/$id")({
  head: () => ({
    meta: [
      { title: "Akkaunt tarixi — Starts Manager" },
      {
        name: "description",
        content: "Tanlangan Telegram akkauntining starts tarixi va yechib olish imkoniyati.",
      },
      { property: "og:title", content: "Akkaunt tarixi — Starts Manager" },
      {
        property: "og:description",
        content: "Kun, hafta va oy bo'yicha starts tranzaksiyalari tarixi.",
      },
    ],
  }),
  component: AccountHistory,
});

const FILTERS = [
  { key: "today", label: "Bugun", hours: 24 },
  { key: "week", label: "Hafta", hours: 24 * 7 },
  { key: "month", label: "Oy", hours: 24 * 30 },
  { key: "all", label: "Barchasi", hours: Infinity },
] as const;

function AccountHistory() {
  const { id } = useParams({ from: "/account/$id" });
  const [accounts, setAccounts] = useState(() => loadAccounts());
  const account = useMemo(() => accounts.find((a) => a.id === Number(id)), [accounts, id]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("today");
  const [amount, setAmount] = useState("");
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  const items: HistoryItem[] = useMemo(() => {
    if (!account) return [];
    const hours = FILTERS.find((f) => f.key === filter)!.hours;
    const limit = Date.now() - hours * 3600_000;
    return account.history.filter((h) => hours === Infinity || +new Date(h.timestamp) >= limit);
  }, [account, filter]);

  const recordReward = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > 1_000_000) {
      setError("0 dan katta, to'g'ri miqdor kiriting");
      return;
    }
    if (!account) return;
    const timestamp = new Date().toISOString();
    const next = accounts.map((item) =>
      item.id === account.id
        ? {
            ...item,
            stats: {
              today: item.stats.today + value,
              week: item.stats.week + value,
              month: item.stats.month + value,
              total: item.stats.total + value,
            },
            history: [
              {
                timestamp,
                amount: value,
                type: "earned" as const,
                description: "@patrickstarsrobot vazifasidan mukofot (qo'lda qayd etildi)",
              },
              ...item.history,
            ],
          }
        : item,
    );
    setAccounts(next);
    saveAccounts(next);
    setAmount("");
    setError("");
    setRecording(false);
  };

  if (!account) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Akkaunt topilmadi</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-28 pt-5">
      <header className="glass-card mb-4 flex items-center gap-3 p-4">
        <Link
          to="/"
          className="rounded-lg bg-secondary px-3 py-2 text-lg leading-none hover:bg-secondary/70"
          aria-label="Orqaga"
        >
          ⬅️
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{account.name}</h1>
          <p className="text-sm text-accent">
            @{account.username} · {maskPhone(account.phone)}
          </p>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-4 gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-2 py-2 text-sm font-medium ${
              filter === f.key
                ? "gift-button text-primary-foreground"
                : "glass-card text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="glass-card p-6 text-center text-sm text-muted-foreground">
            Bu davr uchun yozuvlar yo'q
          </p>
        )}
        {items.map((h, i) => {
          const positive = h.type !== "sent";
          return (
            <div key={i} className="glass-card flex items-center justify-between p-3">
              <div className="min-w-0">
                <p className="text-sm">
                  {h.type === "earned"
                    ? `clicker'dan ${fmt(h.amount)} starts oldim`
                    : h.description}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{fmtDate(h.timestamp)}</p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold ${
                  positive ? "text-success" : "text-destructive"
                }`}
              >
                {positive ? "+" : "−"}
                {fmt(h.amount)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-lg px-4 pb-4">
        <button
          onClick={() => setRecording(true)}
          className="gift-button w-full rounded-2xl py-4 text-base font-bold text-primary-foreground hover:opacity-95"
        >
          ⭐ Mukofotni qo'lda qayd etish
        </button>
      </div>

      {recording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <form onSubmit={recordReward} className="glass-card w-full max-w-sm p-5">
            <h2 className="text-lg font-bold">Stars mukofotini qayd etish</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              @patrickstarsrobot’da olgan mukofotingizni kiriting. Miqdor avtomatik tekshirilmaydi.
            </p>
            <label className="mt-4 block text-xs text-muted-foreground">
              Miqdor
              <input
                autoFocus
                type="number"
                min="0.01"
                max="1000000"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError("");
                }}
                className="mt-1 w-full rounded-xl border border-input bg-secondary/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Masalan: 0.10"
              />
            </label>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setRecording(false)}
                className="flex-1 rounded-xl bg-secondary py-3 text-sm font-medium"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="gift-button flex-1 rounded-xl py-3 text-sm font-semibold text-primary-foreground"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
