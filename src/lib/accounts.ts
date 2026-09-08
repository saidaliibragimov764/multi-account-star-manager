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

const now = Date.now();
const h = (n: number) => new Date(now - n * 3600_000).toISOString();

function makeHistory(seed: number): HistoryItem[] {
  const items: HistoryItem[] = [];
  for (let i = 0; i < 18; i++) {
    const t: TxType = i % 7 === 0 ? "sent" : i % 5 === 0 ? "received" : "earned";
    items.push({
      timestamp: h(i * 6 + (seed % 5)),
      amount: Number((0.1 + ((i * seed) % 9) / 20).toFixed(2)),
      type: t,
      description:
        t === "earned"
          ? "clicker'dan starts oldim"
          : t === "sent"
            ? "asosiy akkauntga yuborildi"
            : "boshqa akkauntdan qabul qilindi",
    });
  }
  return items;
}

export const ACCOUNTS: Account[] = [
  {
    id: 1,
    name: "Mirfayz Erkinov",
    username: "mirfayz",
    phone: "+998 90 123 45 67",
    is_main: true,
    online: true,
    stats: { today: 24.6, week: 132.4, month: 511.2, total: 2140.9 },
    history: makeHistory(3),
  },
  {
    id: 2,
    name: "Aziz Karimov",
    username: "aziz_k",
    phone: "+998 91 222 33 44",
    is_main: false,
    online: true,
    stats: { today: 12.3, week: 74.1, month: 288.5, total: 980.4 },
    history: makeHistory(5),
  },
  {
    id: 3,
    name: "Dilnoza S.",
    username: "dilnoza_s",
    phone: "+998 93 555 66 77",
    is_main: false,
    online: false,
    stats: { today: 8.1, week: 41.7, month: 160.2, total: 620.7 },
    history: makeHistory(7),
  },
  {
    id: 4,
    name: "Sardor Bek",
    username: "sardorbek",
    phone: "+998 94 888 99 00",
    is_main: false,
    online: true,
    stats: { today: 15.9, week: 88.2, month: 320.6, total: 1305.1 },
    history: makeHistory(11),
  },
];

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

export const ACCESS_CODE = "Mirfayz2010";
export const AUTH_KEY = "userbot_auth_ok";
