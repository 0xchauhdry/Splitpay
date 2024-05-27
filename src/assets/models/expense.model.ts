export interface ExpenseModel {
  date: Date,
  title: string,
  currency: string,
  balance: number,
  detail: ExpenseDetailModel
}

interface ExpenseDetailModel {
  amount: number,
  createdBy: string,
  paidBy: string[],
  shares: ShareModel[]
}

interface ShareModel {
  name: string,
  owes: number,
  gets: number
}