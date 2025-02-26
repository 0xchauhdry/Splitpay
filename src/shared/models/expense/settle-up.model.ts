import { User } from "../user.model";

export class SettleUp {
    payer: User;
    receipent: User;
    amount: number;
    groupId: number;
    currencyId: number;
    date: Date
}
