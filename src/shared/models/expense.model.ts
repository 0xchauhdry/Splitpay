import { Currency } from "./currency.model"
import { Group } from "./group.model"
import { User } from "./user.model"

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

export interface ExpenseComment {
  id: number,
  text: string,
  addedBy: User,
  createDate: Date,
  isSystemComment: boolean
  details: string[]
}

export interface UserShare {
  user: User,
  owed: number,
  paid: number
}