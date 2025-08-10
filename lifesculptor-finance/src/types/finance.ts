export type AccountType = "cash" | "bank" | "credit" | "savings" | "investment";
export type TxnType = "income" | "expense" | "transfer";

export type Account = {
  id: string;
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

export type Transaction = {
  id: string;
  type: TxnType;
  accountId: string;
  amount: number; // positive; sign is implied by type
  categoryId?: string;
  note?: string;
  tags?: string[];
  date: string; // ISO
  createdAt: string;
  updatedAt?: string;
};
