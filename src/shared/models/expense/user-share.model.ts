import { User } from "../user.model";

export interface UserShare {
  user: User,
  owed: number,
  paid: number
}
