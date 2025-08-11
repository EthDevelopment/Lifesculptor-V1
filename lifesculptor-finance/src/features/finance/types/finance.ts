export type AccountId = string;

export type AccountType = "cash" | "bank" | "credit" | "savings" | "investment";

export type TxnType =
  | "income"
  | "expense"
  | "transfer"
  | "invest"
  | "debt"
  | "adjustment"; // system-generated reconcile delta

export type Account = {
  id: AccountId;
  name: string;
  type: AccountType;
  currency: "GBP"; // MVP
  createdAt: string; // ISO
  archived?: boolean;
};

export type Category = {
  id: string;
  name: string;
  kind: "income" | "expense";
  emoji?: string;
  color?: string;
};

/**
 * Point-in-time checkpoint of finances.
 * Totals are used for net worth math.
 * Optional per-account detail is used when "Sync accounts" is enabled.
 */
export type Snapshot = {
  id: string;
  date: string; // yyyy-mm-dd

  // Totals used by charts / net worth
  bankCash?: number;
  creditUsed?: number; // sum of outstanding balances across credit lines
  creditAvailable?: number; // sum of limits (metadata; doesn't hit NW)
  investments?: number;

  /**
   * Flat map of target balances used for reconciliation.
   * Key is AccountId; value is the balance/used amount at the snapshot date.
   * For credit cards, store the positive "used" (outstanding) balance.
   */
  accountBalances?: Record<AccountId, number>;

  // Optional richer breakdowns (future-proof; not required by store logic today)
  bankBalances?: Record<AccountId, number>; // bank/cash/savings balances
  investmentValues?: Record<AccountId, number>; // investments values
  creditLines?: Record<AccountId, { limit?: number; used: number }>;
};

export type Transaction = {
  id: string;
  type: TxnType;
  accountId: AccountId; // for income/expense/adjustment OR FROM account for transfer/invest/debt
  transferAccountId?: AccountId; // TO account (only for transfer/invest/debt)
  amount: number; // positive; sign implied by type
  categoryId?: string; // not used for transfer/invest/debt/adjustment
  note?: string;
  tags?: string[];
  date: string; // ISO
  createdAt: string;
  updatedAt?: string;

  // System-generated reconciliation entry (excluded from income/expense)
  isReconcile?: boolean;
};
