export type AccountType = "cash" | "bank" | "credit" | "savings" | "investment";
export type TxnType = "income" | "expense" | "transfer" | "invest" | "debt"; // invest & debt behave like transfers

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
  accountId: string; // FROM account (for transfer/invest/debt) or the account for income/expense
  transferAccountId?: string; // TO account (only for transfer/invest/debt)
  amount: number; // positive; sign implied by type
  categoryId?: string; // (not used for transfer/invest/debt)
  note?: string;
  tags?: string[];
  date: string; // ISO
  createdAt: string;
  updatedAt?: string;
};
