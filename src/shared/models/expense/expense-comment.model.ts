import { User } from "../user.model"

export interface ExpenseComment {
  id: number,
  text: string,
  addedBy: User,
  createDate: Date,
  isSystemComment: boolean
  details: string[]
}
