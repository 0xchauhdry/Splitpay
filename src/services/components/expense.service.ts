import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ExpensesModel } from 'src/models/expense.model';
import { AuthService } from '../auth/auth.service';
import { User } from 'src/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  userId: number = 0;
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.authService.user$.subscribe({
      next: (user: User) => {
        if(user){
          this.userId = user.id;
        }
      }
    })
  }

  public Add(expense: ExpensesModel): Observable<any> {
    return this.apiService.post(`expense/add`, expense);
  }

  public Update(id: number, expense: ExpensesModel, comments: string[]): Observable<any> 
  {
    return this.apiService.put(`expense/update`, { id, expense, comments });
  }

  public GetAll(groupId: number, pageNumber: number, pageSize: number): Observable<any> 
  {
    const queryparams = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.apiService.get(`expense/group/${groupId}?${queryparams}`);
  }
}
