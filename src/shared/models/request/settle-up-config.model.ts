import { Currency } from "../currency.model";
import { Expense } from "../expense.model";
import { User } from "../user.model";

export class SettleUpConfig {
    payer: User;
    receipent: User;
    users: User[];
    groupId: number;
    currency: Currency;
    isEdit: boolean;
    expense: Expense;
    fromComponent: string;
}
