import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { AddExpenseComponent } from 'src/shared/components/add-expense/add-expense.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { Subscription, finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/shared/models/user.model';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { Store } from '@ngrx/store';
import { getFriends, getGroups } from 'src/store/selectors';
import { AddSettleUpComponent } from 'src/shared/components/add-settle-up/add-settle-up.component';
import { SettleUpConfig } from 'src/shared/models/settle-up-config.model';
import { CardModule } from 'primeng/card';
import { ExpenseListComponent } from '../../expense-list/expense-list.component';
import { Expense } from 'src/shared/models/expense.model';
import { LoaderService } from 'src/services/services/loader.service';
import { ExpenseService } from 'src/services/components/expense.service';
import { Friend } from 'src/shared/models/friend.model';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';

@Component({
  selector: 'app-friends-detail',
  standalone: true,
  imports: [
    CommonModule,
    DynamicDialogModule,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    RouterOutlet,
    RouterModule,
    CardModule,
    ExpenseListComponent
  ],
  providers:[
    DialogService,
    ExpenseService
  ],
  templateUrl: './friends-detail.component.html',
  styleUrl: './friends-detail.component.scss'
})
export class FriendsDetailComponent implements OnInit, OnDestroy {
  loggedInUser: User;
  friend: User;
  expenses: Expense[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;
  subscription: Subscription;
  tooltipOptions = {
    tooltipPosition: 'bottom',
    tooltipStyleClass: 'transformTooltip'
  };

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public dialogService: DialogService,
    private authService: AuthService,
    private loader: LoaderService,
    private expenseService: ExpenseService,
    private expenseBroadcastService: ExpenseBroadcastService
  ) {
    this.subscription = new Subscription();
  }
  
  ngOnInit() {
    this.getLoggedInUser();

    this.subscription.add(
      this.route.paramMap
      .subscribe(params => {
         let friendId = +params.get('friendId');
         if (friendId !== this.friend?.id || 0){
          this.expenses = [];
          this.pageNumber = 1;
          this.totalRecords = 0;
          this.getFriend(friendId);
         }
      })
    );
  }

  getLoggedInUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.loggedInUser = user;
      })
    );
  }
  
  getFriend(friendId: number){
    this.subscription.add(
      this.store.select(getFriends)
      .subscribe((friends: Friend[]) => {
        if(friends && friends.length > 0) {
          this.friend = friends.find(x => x.id === friendId);
          this.getExpenses(this.friend.id, this.pageNumber, this.pageSize)
        }
      })
    )
  }
  
  showExpenseDialog() {
    const dialogRef = this.dialogService.open(AddExpenseComponent, {
      header: 'Add Expense',
      width: '60vw',
      modal: true,
      data: { expense: null, groupId: 0 },
      contentStyle: { overflow: 'auto' },
      breakpoints: { '1199px': '75vw', '575px': '90vw' },
    });

    this.subscription.add(
      dialogRef.onClose.subscribe((result: boolean) => {
        if (result){
          this.expenseBroadcastService.updateBalance = true;
        }
      })
    )
  }

  showSettleUpDialog() {
    const settleUpConfig  = {
      payer: this.friend,
      receipent: this.loggedInUser,
      users: [this.friend, this.loggedInUser],
      groupId: 0,
      isEdit: false,
      fromComponent: 'Friends Detail'
    } as SettleUpConfig;

    const dialogRef = this.dialogService.open(AddSettleUpComponent, {
      header: 'Settle Up',
      width: '40vw',
      modal: true,
      data: settleUpConfig,
      contentStyle: { overflow: 'auto' },
      breakpoints: { '1199px': '75vw', '575px': '90vw' },
    });
    
    this.subscription.add(
      dialogRef.onClose.subscribe((result: boolean) => {
        if (result){
          this.expenseBroadcastService.updateBalance = true;
        }
      })
    )
  }

  subscribeToUpdateExpense(){
    this.subscription.add(
      this.expenseBroadcastService.updateExpenseList
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
      this.expenseBroadcastService.deleteExpense
      .subscribe((expenseId: number) => {
        if (expenseId){
          let expenseList = this.expenses.filter(x => x.id !== expenseId)
          this.expenses = expenseList;
        }
      })
    );
  }

  getExpenses(friendId: number, pageNumber: number, pageSize: number) {
    this.loader.show();
    this.subscription.add(
      this.expenseService
      .getFriendExpenses(friendId, pageNumber, pageSize)
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
    if (this.pageNumber * this.pageSize < this.totalRecords){
      this.pageNumber++;
      this.getExpenses(this.friend.id, this.pageNumber, this.pageSize);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
