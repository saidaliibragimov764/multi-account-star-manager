export type TxType = "earned" | "sent" | "received";

export type HistoryItem = {
  timestamp: string;
  amount: number;
  type: TxType;
  description: string;
};

export type Account = {
  id: number;
  name: string;
  username: string;
  phone: string;
  is_main: boolean;
  online: boolean;
  stats: { today: number; week: number; month: number; total: number };
  history: HistoryItem[];
};

export const ACCOUNTS: Account[] = [];

export const totals = (accs: Account[]) => ({
  today: accs.reduce((s, a) => s + a.stats.today, 0),
  week: accs.reduce((s, a) => s + a.stats.week, 0),
  month: accs.reduce((s, a) => s + a.stats.month, 0),
  total: accs.reduce((s, a) => s + a.stats.total, 0),
});

export const maskPhone = (p: string) => p.slice(0, 8) + " ••• •• " + p.slice(-2);

export const fmt = (n: number) =>
  n.toLocaleString("uz-UZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} | ${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
};

export const STORE_KEY = "userbot_accounts_v1";

export function loadAccounts(): Account[] {
  if (typeof window === "undefined") return ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return ACCOUNTS;
    const parsed = JSON.parse(raw) as Account[];
    return Array.isArray(parsed) && parsed.length ? parsed : ACCOUNTS;
  } catch {
    return ACCOUNTS;
  }
}

export function saveAccounts(accs: Account[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(accs));
  } catch {
    /* ignore */
  }
}

export function createAccount(input: {
  name: string;
  username: string;
  phone: string;
  is_main: boolean;
}): Account {
  return {
    id: Date.now(),
    name: input.name.trim().slice(0, 60),
    username: input.username.trim().replace(/^@/, "").slice(0, 32),
    phone: input.phone.trim().slice(0, 20),
    is_main: input.is_main,
    online: true,
    stats: { today: 0, week: 0, month: 0, total: 0 },
    history: [],
  };
}
