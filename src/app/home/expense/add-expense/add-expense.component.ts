import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, finalize } from 'rxjs';
import { AbsolutePipe } from 'src/app/shared/pipes/absolute.pipe';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  ExpensesModel,
  ExpenseDetailsModel,
  ExpenseModel,
} from 'src/models/expense.model';
import { ExpenseService } from 'src/services/components/expense.service';
import { User } from 'src/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { CurrencyBroadcastService } from 'src/services/broadcast/currency-broadcast.service';
import { Currency } from 'src/models/currency.model';
import { Group } from 'src/models/group.model';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    AbsolutePipe,
    ButtonModule,
    MultiSelectModule,
  ],
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent implements OnInit, OnDestroy {
  usersInfo: User[] = [];
  groupInfo: Group;
  expense: ExpenseModel;
  editMode: boolean = false;
  subscription: Subscription;
  groupCurrency: Currency;

  expenseForm: FormGroup;
  payersSum: number = 0;
  divisionsSum: number = 0;
  currentUserId: number;

  constructor(
    private config: DynamicDialogConfig,
    private currencyService: CurrencyBroadcastService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private expenseService: ExpenseService,
    private dialogRef: DynamicDialogRef<AddExpenseComponent>,
    private groupBroadcastService: GroupBroadcastService,
    private notifier: NotifierService,
    private loader: LoaderService,
    private mixpanel: MixpanelService
  ) {
    if (config.data.hasOwnProperty('expense')) {
      this.editMode = true;
      this.expense = this.config.data.expense;
    } else {
      this.editMode = false;
    }

    this.groupInfo = this.config.data.group;
    this.usersInfo = this.groupInfo.users;

    this.subscription = new Subscription();

    this.expenseForm = new FormGroup({
      desc: new FormControl(this.expense?.title ?? null, Validators.required),
      amount: new FormControl(this.expense?.balance ?? 0, [
        Validators.required,
        Validators.min(0.01),
      ]),
      payers: this.formBuilder.array([]),
      shares: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.currencyService.currencies.subscribe({
        next: (currencies: Currency[]) => {
          this.groupCurrency = currencies.find(x => x.id == this.groupInfo.currency.id);
        },
      })
    );

    this.authService.user$.subscribe({
      next: (user: User) => {
        this.currentUserId = user.id;
        const updatedList = this.usersInfo.filter(x => x.id != user.id)
        const currentUserItem = this.usersInfo.find(x => x.id == user.id)
        this.usersInfo = [currentUserItem, ...updatedList];

        // create form controls for users (paid and borrowed)
        this.setFormControls();
      },
    });
  }

  setFormControls(): void {
    const payers = this.expenseForm.get('payers') as FormArray;
    const shares = this.expenseForm.get('shares') as FormArray;
    this.usersInfo.forEach((user) => {
      payers.push(this.addPayer(user));
      shares.push(this.addShare(user));
    });
  }

  addPayer(user: User) {
    const name = user.name.first + ' ' + user.name.last;
    const share = this.expense?.detail.shares.find(
      (share) => share.userId === user.id
    );
    let paid: number = 0;
    if (share !== undefined && share !== null){
      paid = share.owes + share.gets;
    }

    return this.createFormControl(name, paid);
  }

  addShare(user: User) {
    const name = user.name.first + ' ' + user.name.last;
    const share = this.expense?.detail.shares.find(
      (share) => share.userId === user.id
    );
    let owed: number = 0;
    if (share !== undefined && share !== null){
      owed = share.owes;
    }

    return this.createFormControl(name, owed);
  }

  createFormControl(name: string, amount: number): FormGroup {
    return this.formBuilder.group({
      name: [name],
      share: [amount, [Validators.required, Validators.min(0)]],
    });
  }

  divideAmount() {
    this.payersSum = 0;
    this.divisionsSum = 0;

    const currentState = this.payers.controls[0].value;
    const amount = this.expenseForm.get('amount').value;

    // set all of the payer's amount to 0
    this.payers.controls.forEach((control) => {
      control.patchValue({ name: control.get('name').value, share: 0 });
    });

    // update the payment of the logged in user
    this.payers.controls[0].patchValue({
      name: currentState.name,
      share: amount,
    });

    // calculate the equally divided amount for each user
    const dividend = (
      (this.expenseForm.get('amount')?.value ?? 0) / this.usersInfo.length
    ).toFixed(2);

    this.shares.controls.forEach((control) => {
      control.patchValue({ name: control.get('name').value, share: dividend });
    });
  }

  get payers(): FormArray {
    return this.expenseForm.get('payers') as FormArray;
  }

  get shares(): FormArray {
    return this.expenseForm.get('shares') as FormArray;
  }

  checkAmount(payers: boolean) {
    if (payers) {
      const sharesAdded = this.payers.value.reduce(
        (acc: number, item: { name: string; share: number }) => {
          return acc + parseFloat((item.share ?? 0).toString());
        },
        0 // start from 0
      );
      this.payersSum = +parseFloat(
        (this.expenseForm.get('amount').value - sharesAdded).toString()
      ).toFixed(2);
    } else {
      const sharesAdded = this.shares.value.reduce(
        (acc: number, item: { name: string; share: number }) => {
          return acc + parseFloat((item.share ?? 0).toString());
        },
        0
      );
      this.divisionsSum = +parseFloat(
        (this.expenseForm.get('amount').value - sharesAdded).toString()
      ).toFixed(2);
    }
  }

  AddExpense() {
    if (this.expenseForm.invalid) {
      this.notifier.warning('Form is invalid', 'Invalid');
      return;
    }

    const userShares: ExpenseDetailsModel[] = [];

    for (let i = 0; i < this.usersInfo.length; i++) {
      const share: ExpenseDetailsModel = {
        UserID: this.usersInfo[i].id,
        Name: this.usersInfo[i].name.first,
        Paid: parseFloat(this.payers.controls[i].get('share').value),
        Owed: parseFloat(this.shares.controls[i].get('share').value),
      };
      userShares.push(share);
    }

    const expense: ExpensesModel = {
      Name: this.expenseForm.get('desc').value,
      Description: '',
      Amount: parseFloat(this.expenseForm.get('amount').value),
      CurrencyID: this.groupCurrency.id,
      GroupID: this.groupInfo.id,
      AddedBy: this.currentUserId,
      IsSettlement: 0,
      ExpenseDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
      Details: userShares,
    };

    this.loader.show()
    if (this.editMode) {
      const comments = this.getComments(this.expense, expense);
      this.subscription.add(
        this.expenseService
          .Update(this.expense.id, expense, comments)
          .pipe(
            finalize(() => {
              this.loader.hide();
            })
          )
          .subscribe((data) => {
            if (data[0].Id) {
	            this.groupBroadcastService.updateExpenseList = true;
              this.mixpanel.log('Expense Updated', { expenseId: this.expense.id })
              this.dialogRef.close();
            }
          })
      );
    } else {
      this.subscription.add(
        this.expenseService.Add(expense)
        .pipe(
          finalize(() => {
            this.loader.hide();
          })
        )
        .subscribe((data) => {
          if (data[0].Id) {
	          this.groupBroadcastService.updateExpenseList = true;
            this.mixpanel.log('Expense Added', { expenseId: data[0].Id })
            this.dialogRef.close();
          }
        })
      );
    }
  }

  getComments(oldExpense: ExpenseModel, newExpense: ExpensesModel) {
    let comments: string[] = [];
    newExpense.Details.forEach((share) => {
      const oldShare = oldExpense.detail.shares.filter(
        (old) => old.userId === share.UserID
      );
      if (oldShare) {
        const currency = oldExpense.currency;
        const oldOwe = parseFloat(oldShare[0].owes.toString());
        const newOwe = parseFloat(share.Owed.toString());
        const oldPay = oldOwe + parseFloat(oldShare[0].gets.toString());
        const newPay = parseFloat(share.Paid.toString());

        const createComment = (
          type: string,
          oldAmount: number,
          newAmount: number
        ) => {
          if (oldAmount === newAmount) return '';
          if (oldAmount === 0)
            return `${share.Name}'s ${type} changed to ${currency} ${newAmount}`;
          if (newAmount === 0) return `${share.Name}'s ${type} was removed`;
          return `${share.Name}'s ${type} changed from ${currency} ${oldAmount} to ${currency} ${newAmount}`;
        };

        const oweComment = createComment('share', oldOwe, newOwe);
        const payComment = createComment('payment', oldPay, newPay);

        [oweComment, payComment].forEach((comment) => {
          if (comment) comments.push(comment);
        });
      }
    });
    return comments;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
