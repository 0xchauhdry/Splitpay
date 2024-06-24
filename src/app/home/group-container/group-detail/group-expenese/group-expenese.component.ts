import { Component, OnInit } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { AddExpenseComponent } from 'src/app/home/expense/add-expense/add-expense.component';
import { ExpenseComponent } from 'src/app/home/expense/expense.component';
import { ExpenseModel } from 'src/models/expense.model';
import { Group } from 'src/models/group.model';
import { User } from 'src/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { ExpenseService } from 'src/services/components/expense.service';

@Component({
  selector: 'app-group-expenese',
  standalone: true,
  imports: [
    DataViewModule,
    ExpenseComponent
  ],
  providers: [DialogService],
  templateUrl: './group-expenese.component.html',
  styleUrl: './group-expenese.component.scss'
})
export class GroupExpeneseComponent implements OnInit {
  expenses: ExpenseModel[] = [];
  user: User;
  pageSize: number = 10;
  pageNumber: number = 1;
  subscription: Subscription;
  group: Group;
  ref: DynamicDialogRef | undefined;

  constructor(
    private expenseService: ExpenseService,
    private authService: AuthService,
    private groupBroadcastService: GroupBroadcastService,
    public dialogService: DialogService,
  ){
    this.subscription = new Subscription();
  }
  ngOnInit(): void {
    this.authService.user$.subscribe({
      next: (user: User) => {
        if (user){
          this.user = user;
        }
      }
    });
    
    this.subscription.add(
      this.groupBroadcastService.selectedGroup
      .subscribe((group: Group) => {
        if (group){
          this.group = group;
          this.GetExpenses(this.group.id, this.pageNumber, this.pageSize);
        }
      })
    );

        
    this.subscription.add(
      this.groupBroadcastService.updateExpenseList
      .subscribe((update: boolean) => {
        if (update){
          this.GetExpenses(this.group.id, this.pageNumber, this.pageSize);
        }
      })
    );
  }
  

  GetExpenses(groupId: number, pageNumber: number, pageSize: number) {
    this.expenses = [];
    this.expenseService
      .GetAll(groupId, pageNumber, pageSize)
      .subscribe((res) => {
        res.forEach((exp: any) => {
          let expense: ExpenseModel = {
            id: exp.ExpenseId,
            date: exp.ExpenseDate,
            title: exp.Name,
            currency: exp.Currency,
            balance: exp.Amount,
            comments: exp.Comments,
            detail: {
              amount: exp.Amount,
              createdBy: exp.FirstName + ' ' + exp.LastName,
              paidBy: exp.Detail.filter((share) => share.Paid > 0).map(
                (share) => share.FirstName + ' ' + share.LastName
              ),
              userShare: exp.Detail.filter(
                (share) => share.UserId == this.user.id
              ).map((share) => {
                return {
                  userId: share.UserId,
                  name: share.FirstName + ' ' + share.LastName,
                  owes: share.Owed,
                  gets: parseFloat(share.Paid) - parseFloat(share.Owed),
                };
              })[0],
              shares: exp.Detail.map((share) => {
                return {
                  userId: share.UserId,
                  name: share.FirstName + ' ' + share.LastName,
                  owes: share.Owed,
                  gets: parseFloat(share.Paid) - parseFloat(share.Owed),
                };
              }),
            },
          };
          this.expenses.push(expense);
        });
      });
  }

    
  editExpense(expense: ExpenseModel) {
    this.ref = this.dialogService.open(AddExpenseComponent, {
      header: 'Edit Expense',
      width: '60vw',
      modal: true,
      contentStyle: { overflow: 'auto' },
      data: {
        group: this.group,
        expense: expense,
      },
      breakpoints: { '1199px': '75vw', '575px': '90vw' },
    });
  }

}
