import { Currency } from "../currency.model"
import { User } from "../user.model"

export class GroupRequest{
  id: number
  name: string
  description: string
  actionBy: User
  currency: Currency
  addedUsers : User[]
  removedUsers: User[]
}
