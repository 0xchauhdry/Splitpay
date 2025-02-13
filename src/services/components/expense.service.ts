import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Expense } from 'src/shared/models/expense.model';
import { SettleUp } from 'src/shared/models/settle-up.model';
import { GetExpenseRequest } from 'src/shared/models/request/get-expense.request.model';

@Injectable({
  providedIn: "root"
})
export class ExpenseService {
  constructor(private apiService: ApiService) {}

  public add(expense: Expense): Observable<any> {
    return this.apiService.post(`expense`, expense);
  }

  public update(expense: Expense): Observable<any> {
    return this.apiService.put(`expense/${expense.id}`, expense);
  }

  public delete(expenseId: number): Observable<any> {
    return this.apiService.delete(`expense/${expenseId}`);
  }

  public settleUp(settleUp: SettleUp): Observable<any> {
    return this.apiService.post('expense/settle', settleUp);
  }

  public getExpenses(pageNumber: number, pageSize: number): Observable<any> {
    const queryparams = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.apiService.get(`expense/?${queryparams}`);
  }

  public getGroupExpenses(groupId: number, getExpense: GetExpenseRequest): Observable<any> {
    return this.apiService.post(`expense/group/${groupId}`, getExpense);
  }

  public getFriendExpenses(
    friendId: number,
    pageNumber: number,
    pageSize: number): Observable<any>
  {
    const queryparams = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.apiService.get(`expense/friend/${friendId}?${queryparams}`);
  }
}
