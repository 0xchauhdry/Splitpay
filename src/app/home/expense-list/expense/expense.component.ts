import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Expense } from 'src/shared/models/expense/expense.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ExpenseService } from 'src/services/components/expense.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { AddExpenseComponent } from 'src/shared/components/add-expense/add-expense.component';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { CardModule } from 'primeng/card';
import { SettleUpConfig } from 'src/shared/models/request/settle-up-config.model';
import { AddSettleUpComponent } from 'src/shared/components/add-settle-up/add-settle-up.component';
import { ExpenseDetailComponent } from '../expense-detail/expense-detail.component';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';
import { UserShare } from 'src/shared/models/expense/user-share.model';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    ConfirmDialogModule,
    CardModule
  ],
  providers: [
    DatePipe,
    ConfirmationService,
    ExpenseService
  ],
})

export class ExpenseComponent implements OnInit, OnDestroy {
  @Input() expense: Expense;
  totalPaid: number;
  payers: UserShare[];
  payerName: string;
  notInvolved: boolean = false;
  balance: number = 0;
  subscription: Subscription;
  currentUserId: number = 0;
  payer: User;
  receipent: User;
  tooltipOptions = {
    tooltipPosition: 'bottom',
    tooltipStyleClass: 'transformTooltip'
  };

  constructor(
    private dialog: DialogService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private expenseService: ExpenseService,
    private notifier: NotifierService,
    public dialogService: DialogService,
    private expenseBroadcastService: ExpenseBroadcastService,
    private mixpanel: MixpanelService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.updateLocalVariables();
  }

  getCurrentUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.currentUserId = user.id;
      })
    );
  }

  updateLocalVariables(){
    if (this.expense.isSettlement){
      const payerShare = this.expense.shares.find(x => x.paid > 0);
      this.payer = payerShare.user;
      this.totalPaid = payerShare.paid;
      this.receipent = this.expense.shares.find(x => x.owed > 0).user;
    }
    else{
      this.payers = this.expense.shares.filter(x => x.paid > 0) || [];
      this.totalPaid = this.payers.reduce((sum, share) => sum + share.paid, 0) || 0;

      if (this.payers.length == 1){
        if (this.payers[0].user.id == this.currentUserId){
          this.payerName = "You"
        }else{
          this.payerName = this.payers[0].user.name.display;
        }
      }

      const currentuserShare = this.expense.shares.find(x => x.user.id == this.currentUserId)
      if (currentuserShare == null || currentuserShare == undefined){
        this.notInvolved = true;
      }
      else {
        this.balance = currentuserShare.paid - currentuserShare.owed;
      }
    }
  }

  OpenExpenseDetail() {
    const dialogRef = this.dialog.open(ExpenseDetailComponent, {
      data: this.expense,
      header: "Expense: " + this.expense.title,
      width: '60vw',
      breakpoints: { '1299px': '75vw', '950px': '90vw' },
    });

    this.subscription.add(
      dialogRef.onClose.subscribe((result) => {
        console.log(`Result is ${result}`);
      })
    );
  }

  editExpense(){
    let dialogRef: DynamicDialogRef;
    if (this.expense.isSettlement){
      const settleUpConfig: SettleUpConfig  = {
        payer: this.payer,
        receipent: this.receipent,
        users: [this.payer, this.receipent],
        groupId: this.expense.group.id,
        currency: this.expense.currency,
        isEdit: true,
        expense: this.expense,
        fromComponent: 'Expense'
      };

      dialogRef = this.dialogService.open(AddSettleUpComponent, {
        header: 'Settle Up',
        width: '600px',
        modal: true,
        data: settleUpConfig,
        contentStyle: { overflow: 'auto' },
        breakpoints: { '1199px': '75vw', '575px': '90vw' },
      });
    }
    else{
      dialogRef = this.dialogService.open(AddExpenseComponent, {
        header: 'Edit Expense',
        width: '60vw',
        modal: true,
        data: { expense: this.expense, groupId: null },
        contentStyle: { overflow: 'auto' },
        breakpoints: { '1199px': '75vw', '575px': '90vw' },
      });
    }

    this.subscription.add(
      dialogRef.onClose.subscribe((result: boolean) => {
        if (result){
          this.expenseBroadcastService.updateBalance = true;
        }
      })
    );
  }


  deleteExpense(){
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this expense?',
      header: 'Delete Expense Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      accept: () => {
        this.subscription.add(
          this.expenseService.delete(this.expense.id)
          .subscribe({
            next: () => {
              this.expenseBroadcastService.deleteExpense = this.expense.id;
              this.expenseBroadcastService.updateBalance = true;
              this.notifier.info('Expense deleted successfully.', 'Deleted');
              this.mixpanel.log('Expense Deleted', { expenseId: this.expense.id })
            }
          })
        )
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
