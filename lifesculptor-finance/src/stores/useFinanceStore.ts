import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  isBefore,
  isEqual,
} from "date-fns";
import type { Account, Category, Transaction } from "@/types/finance";
import type { Snapshot } from "@/types/finance";

// ---------- Helpers
const nowISO = () => new Date().toISOString();

// Default categories (simple for MVP)
const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-salary", name: "Salary", kind: "income", emoji: "💼" },
  { id: "cat-business", name: "Business", kind: "income", emoji: "💼" },
  { id: "cat-groceries", name: "Groceries", kind: "expense", emoji: "🛒" },
  { id: "cat-rent", name: "Rent", kind: "expense", emoji: "🏠" },
  { id: "cat-transport", name: "Transport", kind: "expense", emoji: "🚇" },
  { id: "cat-eatingout", name: "Eating Out", kind: "expense", emoji: "🍴" },
];

// Seed accounts (example)
const SEED_ACCOUNTS: Account[] = [
  {
    id: "acc-cash",
    name: "Cash",
    type: "cash",
    currency: "GBP",
    createdAt: nowISO(),
  },
  {
    id: "acc-monzo",
    name: "Monzo",
    type: "bank",
    currency: "GBP",
    createdAt: nowISO(),
  },
  {
    id: "acc-amex",
    name: "AMEX",
    type: "credit",
    currency: "GBP",
    createdAt: nowISO(),
  },
  {
    id: "acc-invest",
    name: "Investments",
    type: "investment",
    currency: "GBP",
    createdAt: nowISO(),
  },
];

// ---------- Store shape
type FinanceState = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];

  // Accounts
  addAccount: (input: Omit<Account, "id" | "createdAt">) => string;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transactions
  addTransaction: (
    input: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => string;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Derived
  netWorth: () => number;
  monthIncome: (d?: Date) => number;
  monthExpenses: (d?: Date) => number;
  savingsRate: (d?: Date) => number;
  balanceByAccount: (accountId: string) => number;

  // Historical balance snapshots (for fast backfill)
  snapshots: Snapshot[];
  addSnapshot: (s: Omit<Snapshot, "id">) => string;
  deleteSnapshot: (id: string) => void;
  updateSnapshot: (
    id: string,
    patch: {
      date?: string;
      bankCash?: number;
      creditUsed?: number;
      creditAvailable?: number;
      investments?: number;
    }
  ) => void;
  // Compute net worth at an arbitrary date using latest snapshot <= date + cashflow since
  netWorthAt: (at: Date) => number;

  // Helpers for charts
  latestSnapshotOnOrBefore: (at: Date) => Snapshot | undefined;
  sumCashflowBetween: (
    startExclusive: Date | null,
    endInclusive: Date
  ) => number; // income - expense in (start, end]
  netWorthSeries: (
    rangeFrom: Date,
    rangeTo: Date
  ) => { date: Date; value: number }[];
};

// ---------- Implementation
export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: SEED_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      snapshots: [],

      addSnapshot: (s) => {
        const id = nanoid();
        const clean: Snapshot = {
          id,
          date: new Date(s.date).toISOString().slice(0, 10), // keep YYYY-MM-DD
          bankCash: s.bankCash ?? 0,
          creditUsed: s.creditUsed ?? 0,
          creditAvailable: s.creditAvailable,
          investments: s.investments ?? 0,
        };
        set((st) => ({
          snapshots: [...st.snapshots, clean].sort((a, b) =>
            a.date.localeCompare(b.date)
          ),
        }));
        return id;
      },
      updateSnapshot: (id, patch) => {
        set((st) => {
          const next = st.snapshots.map((s) =>
            s.id === id
              ? { ...s, ...patch, date: (patch.date ?? s.date).slice(0, 10) }
              : s
          );
          // keep snapshots sorted by date
          next.sort((a, b) => a.date.localeCompare(b.date));
          return { snapshots: next };
        });
      },

      deleteSnapshot: (id) => {
        set((st) => ({ snapshots: st.snapshots.filter((x) => x.id !== id) }));
      },

      // Accounts
      addAccount: (input) => {
        const id = nanoid();
        const account: Account = {
          id,
          name: input.name,
          type: input.type,
          currency: input.currency ?? "GBP",
          archived: input.archived,
          createdAt: nowISO(),
        };
        set((s) => ({ accounts: [account, ...s.accounts] }));
        return id;
      },
      updateAccount: (id, patch) => {
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
        }));
      },
      deleteAccount: (id) => {
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          transactions: s.transactions.filter(
            (t) => t.accountId !== id && t.transferAccountId !== id
          ),
        }));
      },

      // Transactions
      addTransaction: (input) => {
        const id = nanoid();
        const txn: Transaction = { ...input, id, createdAt: nowISO() };
        set((s) => ({ transactions: [txn, ...s.transactions] }));
        return id;
      },
      updateTransaction: (id, patch) => {
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: nowISO() } : t
          ),
        }));
      },
      deleteTransaction: (id) => {
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        }));
      },

      // Derived balances per account
      balanceByAccount: (accountId) => {
        const txns = get().transactions;
        let bal = 0;
        for (const t of txns) {
          switch (t.type) {
            case "income":
              if (t.accountId === accountId) bal += t.amount;
              break;
            case "expense":
              if (t.accountId === accountId) bal -= t.amount;
              break;
            case "transfer":
            case "invest":
            case "debt":
              if (t.accountId === accountId) bal -= t.amount; // FROM
              if (t.transferAccountId === accountId) bal += t.amount; // TO
              break;
          }
        }
        return bal;
      },

      // Net worth is the sum of all account balances (credit accounts will be negative if you owe)
      netWorth: () => {
        const { accounts } = get();
        return accounts.reduce(
          (sum, a) => sum + get().balanceByAccount(a.id),
          0
        );
      },

      monthIncome: (d = new Date()) => {
        const txns = get().transactions;
        const range = { start: startOfMonth(d), end: endOfMonth(d) };
        return txns
          .filter(
            (t) =>
              t.type === "income" && isWithinInterval(parseISO(t.date), range)
          )
          .reduce((s, t) => s + t.amount, 0);
      },

      monthExpenses: (d = new Date()) => {
        const txns = get().transactions;
        const range = { start: startOfMonth(d), end: endOfMonth(d) };
        // expenses + transfers/invest/debt that reduce cash this month count as outflow for the month-level “expenses”?
        // For now keep “expenses” strict; cashflow chart already shows net using both.
        return txns
          .filter(
            (t) =>
              t.type === "expense" && isWithinInterval(parseISO(t.date), range)
          )
          .reduce((s, t) => s + t.amount, 0);
      },

      savingsRate: (d = new Date()) => {
        const income = get().monthIncome(d);
        const expense = get().monthExpenses(d);
        if (income === 0) return 0;
        return (income - expense) / income;
      },

      netWorthAt: (at) => {
        const anchor = get().latestSnapshotOnOrBefore(at);
        const base = anchor
          ? (anchor.bankCash ?? 0) + (anchor.investments ?? 0) - (anchor.creditUsed ?? 0)
          : 0;
        const delta = get().sumCashflowBetween(anchor ? parseISO(anchor.date) : null, at);
        return base + delta;
      },

      latestSnapshotOnOrBefore: (at) => {
        const { snapshots } = get();
        return [...snapshots]
          .filter((s) => !isBefore(at, parseISO(s.date)))
          .sort((a, b) => b.date.localeCompare(a.date))[0];
      },

      // Sum of income minus expenses strictly after `startExclusive` and up to and including `endInclusive`.
      sumCashflowBetween: (startExclusive, endInclusive) => {
        const { transactions } = get();
        let sum = 0;
        for (const t of transactions) {
          const d = parseISO(t.date);
          if (startExclusive && (isBefore(d, startExclusive) || isEqual(d, startExclusive))) continue;
          if (isBefore(endInclusive, d)) continue;
          if (t.type === "income") sum += t.amount;
          else if (t.type === "expense") sum -= t.amount;
          // transfer/invest/debt do not change net worth
        }
        return sum;
      },

      // End-of-month net worth series across [rangeFrom, rangeTo], using snapshots + transactions.
      netWorthSeries: (rangeFrom, rangeTo) => {
        const pts: { date: Date; value: number }[] = [];

        // Normalize to month starts
        const start = new Date(rangeFrom.getFullYear(), rangeFrom.getMonth(), 1);
        const end = new Date(rangeTo.getFullYear(), rangeTo.getMonth(), 1);

        let cursor = start;
        while (cursor <= end) {
          const eom = endOfMonth(cursor);
          const dateForPoint = eom <= rangeTo ? eom : rangeTo;
          const value = get().netWorthAt(dateForPoint);
          pts.push({ date: dateForPoint, value });
          // advance one month
          cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        }

        // Ensure we include the final day if rangeTo is not end-of-month and not already included
        const lastPoint = pts[pts.length - 1];
        if (!lastPoint || lastPoint.date.getTime() !== rangeTo.getTime()) {
          pts.push({ date: rangeTo, value: get().netWorthAt(rangeTo) });
        }

        return pts;
      },
    }),
    {
      name: "ls-finance-v1",
      storage: createJSONStorage(() => localStorage),
      version: 2,
    }
  )
);
