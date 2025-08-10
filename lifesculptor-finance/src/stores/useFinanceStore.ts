import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import type { Account, Category, Transaction, TxnType } from "@/types/finance";

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

// Seed accounts (you can delete these once UI exists)
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
};

// ---------- Implementation
export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: SEED_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,
      transactions: [],

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
          transactions: s.transactions.filter((t) => t.accountId !== id),
        }));
      },

      // Transactions
      addTransaction: (input) => {
        const id = nanoid();
        const txn: Transaction = {
          ...input,
          id,
          createdAt: nowISO(),
        };
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

      // Derived
      balanceByAccount: (accountId) => {
        const txns = get().transactions.filter(
          (t) => t.accountId === accountId
        );
        return txns.reduce((sum, t) => {
          if (t.type === "income") return sum + t.amount;
          if (t.type === "expense") return sum - t.amount;
          // transfers ignored for MVP
          return sum;
        }, 0);
      },
      netWorth: () => {
        const { accounts } = get();
        return accounts.reduce(
          (sum, a) =>
            sum + get().balanceByAccount(a.id) * (a.type === "credit" ? -1 : 1),
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
    }),
    {
      name: "ls-finance-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // migration logic can go here as we evolve the schema
    }
  )
);
