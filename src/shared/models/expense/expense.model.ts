import { Currency } from "../currency.model"
import { Group } from "../group.model"
import { User } from "../user.model"
import { ExpenseComment } from "./expense-comment.model"
import { UserShare } from "./user-share.model"

export interface Expense {
  id: number,
  date: Date,
  title: string,
  description: string,
  currency: Currency,
  amount: number,
  addedBy: User,
  group: Group,
  isSettlement: boolean,
  createdDate: Date,
  shares: UserShare[],
  comments: ExpenseComment[],
}

