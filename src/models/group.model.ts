import { Currency } from "./currency.model"
import { User } from "./user.model"

export class Group{
  id: number
  name: string
  description: string
  createdBy: User
  createdDate: Date
  currency: Currency
  users : User[]
}
