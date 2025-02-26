import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, finalize } from 'rxjs';
import { ExpenseListComponent } from 'src/app/home/expense-list/expense-list.component';
import { Expense } from 'src/shared/models/expense/expense.model';
import { Group } from 'src/shared/models/group.model';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { ExpenseService } from 'src/services/components/expense.service';
import { LoaderService } from 'src/services/services/loader.service';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';
import { GetExpenseRequest } from 'src/shared/models/request/get-expense.request.model';

@Component({
  selector: 'app-group-expenese',
  standalone: true,
  imports: [
    ExpenseListComponent
  ],
  providers: [
    DialogService,
    ExpenseService,
  ],
  templateUrl: './group-expenese.component.html',
  styleUrl: './group-expenese.component.scss'
})
export class GroupExpeneseComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  totalRecords: number = 0;
  user: User;
  subscription: Subscription;
  group: Group;
  ref: DynamicDialogRef | undefined;
  getExpenseRequest: GetExpenseRequest = new GetExpenseRequest(1, 10);

  constructor(
    private expenseService: ExpenseService,
    private authService: AuthService,
    private groupBroadcastService: GroupBroadcastService,
    public dialogService: DialogService,
    private loader: LoaderService,
    private expenseBroadcast: ExpenseBroadcastService
  ){
    this.subscription = new Subscription();
  }
  ngOnInit(): void {
    this.groupBroadcastService.showFilters = true;
    this.getCurrentUser();
    this.getSelectedGroup();
    this.subscribeToUpdateExpense();
    this.subscribeToDeleteExpense();
    this.subscribeToGroupFilters();
  }

  getCurrentUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.user = user;
      })
    );
  }

  getSelectedGroup(){
    this.subscription.add(
      this.groupBroadcastService.selectedGroup
      .subscribe((group: Group) => {
        if (group){
          this.group = { ...group };
          this.resetValues();
          this.getExpenses(this.group.id);
        }
      })
    );
  }

  subscribeToGroupFilters(){
    this.subscription.add(
      this.groupBroadcastService.selectedFilters
      .subscribe((getExpenseRequest: GetExpenseRequest) => {
        if (getExpenseRequest){
          this.getExpenseRequest = getExpenseRequest;
          this.resetValues();
          this.getExpenses(this.group.id);
        }
      })
    );
  }

  subscribeToUpdateExpense(){
    this.subscription.add(
      this.expenseBroadcast.updateExpenseList
      .subscribe((update: Expense) => {
        if (update){
          let expenseList = this.expenses.filter(x => x.id !== update.id)
          expenseList.push(update);
          this.expenses = expenseList.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          });
        }
      })
    );
  }

  subscribeToDeleteExpense(){
    this.subscription.add(
      this.expenseBroadcast.deleteExpense
      .subscribe((expenseId: number) => {
        if (expenseId){
          let expenseList = this.expenses.filter(x => x.id !== expenseId)
          this.expenses = expenseList;
        }
      })
    );
  }

  getExpenses(groupId: number) {
    this.loader.show();
    this.subscription.add(
      this.expenseService
      .getGroupExpenses(groupId, this.getExpenseRequest)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe((data) => {
        this.totalRecords = data.totalRecords;
        this.expenses = [ ...this.expenses, ...data.expenses ];
      })
    );
  }

  scroll(){
    if (this.getExpenseRequest.pageNumber * this.getExpenseRequest.pageSize < this.totalRecords){
      this.getExpenseRequest.pageNumber++;
      this.getExpenses(this.group.id);
    }
  }

  resetValues(){
    this.expenses = [];
    this.totalRecords = 0;
    this.getExpenseRequest.pageNumber = 1;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.groupBroadcastService.showFilters = false;
  }
}
