export interface ExpenseModel {
  id: number,
  date: Date,
  title: string,
  currency: string,
  balance: number,
  detail: ExpenseDetailModel
  comments: CommentModel[]
}

interface CommentModel {
  CommentId: number,
  AddedBy: string,
  CreateDate: string,
  Detail: CommentDetailModel[]
}

interface CommentDetailModel{
    Comment: string
}

interface ExpenseDetailModel {
  amount: number,
  createdBy: string,
  paidBy: string[],
  userShare: ShareModel,
  shares: ShareModel[]
}

export interface ShareModel {
  userId: number
  name: string,
  owes: number,
  gets: number
}


export interface ExpensesModel {
  Name: string,
  Description: string,
  Amount: number,
  CurrencyID: number,
  GroupID: number,
  AddedBy: number,
  IsSettlement: number,
  ExpenseDate: string,
  Details: ExpenseDetailsModel[]
}

export interface ExpenseDetailsModel {
  UserID: number,
  Name: string,
  Owed: number,
  Paid: number
}