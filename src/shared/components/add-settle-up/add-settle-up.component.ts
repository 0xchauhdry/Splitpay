import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup,
  FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Subscription, finalize } from 'rxjs';
import { Expense, ExpenseComment, UserShare } from 'src/shared/models/expense.model';
import { SettleUpConfig } from 'src/shared/models/request/settle-up-config.model';
import { SettleUp } from 'src/shared/models/settle-up.model';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { CommonService } from 'src/services/common/common.service';
import { ExpenseService } from 'src/services/components/expense.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';
import { UserService } from 'src/services/components/user.service';
import { Currency } from 'src/shared/models/currency.model';

@Component({
  selector: 'app-add-settle-up',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    RippleModule,
    CalendarModule
  ],
  providers: [
    UserService
  ],
  templateUrl: './add-settle-up.component.html',
  styleUrl: './add-settle-up.component.scss'
})
export class AddSettleUpComponent implements OnInit, OnDestroy {
  settleupForm: FormGroup;
  maxAmount: number = 1000000000.00;
  maxDate: Date;
  subscription: Subscription;
  currentUser: User;
  settleUpConfig: SettleUpConfig;
  isLoading: boolean = false;
  isCurrencyEditable: boolean = false;
  currencies: Currency[];

  constructor(
    private config: DynamicDialogConfig,
    private authService: AuthService,
    private notifier: NotifierService,
    private expenseService: ExpenseService,
    private dialogRef: DynamicDialogRef<AddSettleUpComponent>,
    private mixpanel: MixpanelService,
    private formBuilder: FormBuilder,
    private expenseBroadcastService: ExpenseBroadcastService,
    private userService: UserService
  ){
    this.settleUpConfig = this.config.data;
    this.subscription = new Subscription();
  }
  ngOnInit(): void {
    this.getCurrentUser();
    this.maxDate = new Date();

    this.settleupForm = this.formBuilder.group({
      payer: new FormControl(this.settleUpConfig.payer, Validators.required),
      receipent: new FormControl(this.settleUpConfig.receipent, Validators.required),
      amount: new FormControl(Math.abs(this.settleUpConfig.payer.balance), [
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.maxAmount)
      ]),
      currency: new FormControl(
        { value: this.settleUpConfig.currency.code, disabled: true },
        Validators.required
      ),
      date: new FormControl(this.maxDate, Validators.required)
    });

    if (this.settleUpConfig.isEdit){
      this.settleupForm.get('amount').setValue(this.settleUpConfig.expense.amount);
      this.settleupForm.get('date').setValue(this.settleUpConfig.expense.date);
    }
    else if (this.settleUpConfig.fromComponent.includes('Friend')){
      this.isCurrencyEditable = true;
      this.getCurrencies();
    }
  }

  getCurrentUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        this.currentUser = user;
      })
    );
  }

  getCurrencies(){
    this.subscription.add(
      this.userService.getCurrencies()
      .subscribe({
        next: (currencies: Currency[]) => {
          this.currencies = currencies;
          this.settleupForm.get('currency').enable();
          this.settleupForm.get('currency').setValue(this.currencies[0]);
        },
      })
    );
  }

  payerChange(event: DropdownChangeEvent){
    const receipent = this.settleupForm.get('receipent');
    if (receipent.value.id == event.value.id){
      const selectedReceipent = this.settleUpConfig.users.find(x => x.id !== event.value.id);
      receipent.setValue(selectedReceipent);
    }
  }

  receipentChange(event: DropdownChangeEvent){
    const payer = this.settleupForm.get('payer');
    if (payer.value.id == event.value.id){
      const selectedPayer = this.settleUpConfig.users.find(x => x.id !== event.value.id);
      payer.setValue(selectedPayer);
    }
  }

  onSave(){
    if (this.settleupForm.invalid){
      this.notifier.error('Form is Invalid', 'Invalid');
      return;
    }
    if (this.settleUpConfig.isEdit){
      this.updateSettlement();
    }
    else{
      this.addSettlement();
    }
  }

  addSettlement(){
    const settleUp = {
      payer: this.settleupForm.get('payer').value,
      receipent: this.settleupForm.get('receipent').value,
      date: this.settleupForm.get('date').value,
      amount: this.settleupForm.get('amount').value,
      groupId: this.settleUpConfig.groupId
    } as SettleUp

    if(this.isCurrencyEditable){
      settleUp.currencyId = this.settleupForm.get('currency').getRawValue().id;
    } else {
      settleUp.currencyId = this.settleUpConfig.currency.id;
    }

    this.isLoading = true;
    this.subscription.add(
      this.expenseService.settleUp(settleUp)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (expense) => {
          if (this.settleUpConfig.fromComponent !== 'Group Balance'){
            this.expenseBroadcastService.updateExpenseList = expense;
          }
          this.notifier.success('Settlement Added.', 'Settled Up');
          this.mixpanel.log('Settlement Added', { expenseId : expense.id });
          this.dialogRef.close(true);
        }
      })
    )
  }

  updateSettlement(){
    const expense = { ...this.settleUpConfig.expense};
    expense.amount = this.settleupForm.get('amount').value;
    expense.date = this.settleupForm.get('date').value;
    expense.shares = this.getShares(expense.amount);

    const comment = this.getComment(expense);
    if (comment) {
      expense.comments = [ comment ];
      this.updateExpense(expense);
    }
    else{
      this.notifier.info('No Change in expense.')
      this.dialogRef.close(false);
    }
  }

  getShares(amount: number): UserShare[]{
    const payer = this.settleupForm.get('payer').value;
    const receipent = this.settleupForm.get('receipent').value;
    return [
      { user: payer, paid: amount, owed: 0},
      { user: receipent, paid: 0, owed: amount }
    ];
  }

  updateExpense(expense: Expense){
    this.isLoading = true;
    this.subscription.add(
      this.expenseService
        .update(expense)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe((res) => {
          if (res) {
            this.expenseBroadcastService.updateExpenseList = expense;
            this.mixpanel.log('Settlement Updated', { expenseId: expense.id })
            this.notifier.success('Settlement updated successfully.')
            this.dialogRef.close(true);
          }
        })
    );
  }

  getComment(expense: Expense){
    const comment = {
      addedBy: this.currentUser,
      isSystemComment: true,
      details: [],
    } as ExpenseComment;

    //check if payer is changed
    const oldPayer = this.settleUpConfig.expense.shares.find(x => x.paid > 0);
    const currentPayer = expense.shares.find(x => x.paid > 0);
    if (oldPayer.user.id !== currentPayer.user.id){
      comment.details.push(`Payer changed from  ${oldPayer.user.name.display} to ${currentPayer.user.name.display}.`)
    }

    //compare amounts
    const oldAmount = this.settleUpConfig.expense.amount;
    const currency = expense.currency.code;
    if (CommonService.round(oldAmount) !== CommonService.round(expense.amount)){
      comment.details.push(`Settlement amount changed from  ${currency} ${oldAmount} to ${currency}${expense.amount}.`)
    }
    //compare dates
    const oldDate = this.settleUpConfig.expense.date;
    if (oldDate !== expense.date){
      comment.details.push(`Settlement date changed from ${oldDate} to ${expense.date}.`)
    }

    //return null if there is no change
    return comment.details.length > 0 ? comment : null;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
