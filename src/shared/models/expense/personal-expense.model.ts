import { Currency } from "../currency.model";
import { TransactionType } from "../enums/transaction-type.enum";
import { User } from "../user.model";
import { ExpenseComment } from "./expense-comment.model";
import { Expense } from "./expense.model";

export interface PersonalExpense {
  id: number,
  date: Date,
  title: string,
  description: string,
  transactionType: TransactionType,
  currency: Currency,
  amount: number,
  addedBy: User,
  linkedExpense: Expense,
  isSettlement: boolean,
  createdDate: Date,
  comments: ExpenseComment[],
}
