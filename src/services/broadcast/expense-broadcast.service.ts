import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense } from 'src/shared/models/expense.model';

@Injectable()
export class ExpenseBroadcastService {
  private _updateExpenseList: BehaviorSubject<Expense | null> = new BehaviorSubject(null);

  get updateExpenseList(): Observable<Expense> {
    return this._updateExpenseList;
  }

  set updateExpenseList(newValue: Expense){
    this._updateExpenseList.next(newValue);
  }

  private _deleteExpense: BehaviorSubject<number | null> = new BehaviorSubject(null);

  get deleteExpense(): Observable<number> {
    return this._deleteExpense;
  }

  set deleteExpense(newValue: number){
    this._deleteExpense.next(newValue);
  }
  
  private _updateBalance: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get updateBalance(): Observable<boolean> {
    return this._updateBalance;
  }

  set updateBalance(newValue: boolean){
    this._updateBalance.next(newValue);
  }
}
