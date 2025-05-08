import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, finalize } from 'rxjs';
import { AbsolutePipe } from 'src/shared/pipes/absolute.pipe';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { Expense } from 'src/shared/models/expense/expense.model';
import { ExpenseService } from 'src/services/components/expense.service';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { Currency } from 'src/shared/models/currency.model';
import { Group } from 'src/shared/models/group.model';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { UserService } from 'src/services/components/user.service';
import { CommonService } from 'src/services/common/common.service';
import { Store } from '@ngrx/store';
import { getGroups } from 'src/store/selectors';
import { UserShare } from 'src/shared/models/expense/user-share.model';
import { ExpenseComment } from 'src/shared/models/expense/expense-comment.model';

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
    DropdownModule,
    RippleModule,
    TooltipModule,
    CalendarModule,
    SelectButtonModule
  ],
  providers: [
    CommonService,
    DialogService,
    ExpenseService,
    UserService,
    DatePipe
  ],
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})

export class AddExpenseComponent implements OnInit, OnDestroy {
  group: Group;
  fromGroup: number;
  expense: Expense;
  editMode: boolean = false;
  subscription: Subscription;
  currencies: Currency[] = [];
  groups: Group[] = [];
  users: User[] = [];

  expenseForm: FormGroup;
  paidSum: number = 0;
  owedSum: number = 0;
  currentUser: User;
  isLoading: boolean = false;
  isGroupEditable: boolean = false;
  isCurrencyEditable: boolean = false;
  currency: Currency;
  maxAmount: number = 1000000000.00;
  maxDate: Date;
  showAdditionalSettings: boolean = false;
  singlePayer: boolean = true;
  tooltipOptions = {
    tooltipPosition: 'bottom',
    tooltipStyleClass: 'transformTooltip'
  };

  get shares(): FormArray {
    return this.expenseForm.get('shares') as FormArray;
  }

  constructor(
    private config: DynamicDialogConfig,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private expenseService: ExpenseService,
    private dialogRef: DynamicDialogRef<AddExpenseComponent>,
    private expenseBroadcastService: ExpenseBroadcastService,
    private notifier: NotifierService,
    private mixpanel: MixpanelService,
    private store: Store,
    private datePipe: DatePipe
  ) {
    this.expense = config.data.expense;
    this.fromGroup = config.data.groupId;
    if (this.expense){
      this.editMode = true
    }

    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.maxDate = new Date();
    this.expenseForm = new FormGroup({
      group: new FormControl('', Validators.required),
      currency: new FormControl('', Validators.required),
      desc: new FormControl('', Validators.required),
      amount: new FormControl(0, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.maxAmount)
      ]),
      date: new FormControl('', Validators.required),
      shares: this.formBuilder.array([]),
      payer: new FormControl(''),
      selectedShares: new FormControl(''),
      splitType: new FormControl('Equally'),
      payerType: new FormControl('Single')
    });

    this.getCurrentUser();
    this.getAllGroups();
    this.updateEditModeControls();

    this.subscribeToGroupChange();
    this.subscribeToCurrencyChange();
  }

  getCurrentUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        this.currentUser = user;
      })
    );
  }

  updateEditModeControls(){
    let group = this.expenseForm.get('group');
    let currency = this.expenseForm.get('currency');
    if (this.editMode){ //edit expense case
      this.group = this.groups.find(x => x.id === this.expense.group.id);
      this.users = this.expense.shares.map(share => share.user);
      this.currency = this.expense.currency;
      group.setValue(this.group.name);
      group.disable();
    }
    else{ //add expense case
      this.isGroupEditable = true;
      if (this.fromGroup){ // opened from any group
        this.group = this.groups.find(x => x.id === this.fromGroup);
      }
      else{ //opened from other places
        this.group = this.groups[0];
      }
      this.users = this.group.users;
      this.getCurrencies();
      group.setValue(this.group);
      this.currency = this.group.currency;
    }
    currency.setValue(this.currency.code);
    currency.disable();

    this.expenseForm.get('date').setValue(new Date(this.expense?.date || this.maxDate));
    this.expenseForm.get('desc').setValue(this.expense?.title || '');
    this.expenseForm.get('amount').setValue(this.expense?.amount || 0);

    this.setFormControls();
  }

  setFormControls(): void {
    const updatedList = this.users.filter(x => x?.id != this.currentUser.id)
    const currentUser = this.users.find(x => x?.id == this.currentUser.id)
    if (currentUser) this.users = [currentUser, ...updatedList];

    this.users.forEach((user) => {
      this.shares.push(this.addShare(user));
    });

    if (this.editMode){
      const payers = this.expense.shares.filter(x => x.paid > 0) || [];
      if (payers.length > 1){
        this.expenseForm.get('payerType').setValue('Multiple');
        this.singlePayer = false;
        this.showAdditionalSettings = true;
      }
      const index = this.shares.controls.findIndex(x => x.value.id == payers[0].user.id);
      this.shares.controls[index].get('selectedPayer').setValue(true);
      this.expenseForm.get('payer').setValue(this.shares.controls[index]);

      const firstOwed = this.expense.shares[0].owed;
      const splitEqually = this.expense.shares.every(share => share.owed === firstOwed);

      if (!splitEqually){
        this.expenseForm.get('splitType').setValue('Unequally');
        this.showAdditionalSettings = true;
      }
    }
    else{
      const index = this.shares.controls.findIndex(x => x.value.id == this.currentUser.id);
      this.shares.controls[index].get('selectedPayer').setValue(true);

      const selectedControl = this.shares.controls.find(x => x.value.selectedPayer)
      this.expenseForm.get('payer').setValue(selectedControl);
    }
    this.expenseForm.get('selectedShares').setValue(this.users);
  }

  addShare(user: User) {
    const share = this.expense?.shares.find(share => share.user.id === user.id);
    return this.createFormControl(user, share?.owed || 0, share?.paid || 0);
  }

  createFormControl(user: User, owed: number, paid: number): FormGroup {
    return this.formBuilder.group({
      id: [user.id],
      name: [user.name.display],
      owed: [{ value: owed, disabled: true }, [Validators.min(0), Validators.max(this.maxAmount)]],
      paid: [paid, [Validators.min(0), Validators.max(this.maxAmount)]],
      selectedPayer: [false]
    });
  }

  divideAmount() {
    this.paidSum = 0;
    const selectedControl = this.shares.controls.find(x => x.value.selectedPayer);
    const amount = this.expenseForm.get('amount').value;

    if (this.expenseForm.get('splitType').value == 'Equally'){
      this.owedSum = 0;
      const baseShare = CommonService.round(amount, this.shares.controls.length);
      const sharesArray = this.getsharesArray(baseShare, amount, this.shares.controls.length);
      this.setOwedAmount(sharesArray);
      this.setPaidAmount(0);
    }
    else{
      this.setPaidAmount(0);
      this.checkAmount('owed');
    }

    // find the selected and update paid amount
    if (selectedControl){
      const index = this.shares.controls.findIndex(x => x.value.id === selectedControl.value.id);
      this.shares.controls[index].get('paid').setValue(amount);
    } else {
      this.shares.controls[0].get('paid').setValue(amount);
    }
  }

  getsharesArray(baseShare: number, amount: number, numOfShares: number){
    let totalRounded = baseShare * numOfShares;
    let difference = CommonService.round(amount - totalRounded);

    const sharesArray = new Array(numOfShares).fill(baseShare);
    for (let i = 0; i < Math.abs(difference * 100); i++) {
      sharesArray[i] += difference > 0 ? 0.01 : -0.01;
    }
    return sharesArray;
  }

  setOwedAmount(baseShares: number[]){
    this.shares.controls.forEach((control, index) => {
      control.get('owed').setValue(baseShares[index]);
      control.get('owed').disable();
    });
  }

  setPaidAmount(paid: number){
    this.shares.controls.forEach((control) => {
      control.get('paid').setValue(paid);
    });
  }

  checkAmount(value: string) {
    const sharesAdded = this.shares.value.reduce(
      (acc: number, item: any) => {
        return acc + CommonService.round(item[value] || 0);
      }, 0
    );

    const amountValue = this.expenseForm.get('amount').value;
    this[value + 'Sum'] = CommonService.round(amountValue - sharesAdded);
  }

  getAllGroups(){
    this.subscription.add(
      this.store.select(getGroups)
      .subscribe((groups: Group[]) => {
        if (groups && groups.length > 0){
          this.groups = groups;
          //this.groups.push({ id: 0, name: 'No Group' } as Group);
        }
      })
    )
  }

  payerChange(event: DropdownChangeEvent){
    //unselected the selected
    const selectedIndex = this.shares.controls.findIndex(x => x.value.selectedPayer);
    const paid = this.shares.controls[selectedIndex].get('paid').value;
    this.shares.controls[selectedIndex].get('paid').setValue(0);
    this.shares.controls[selectedIndex].get('selectedPayer').setValue(false);

    //update selected for current value
    const index = this.shares.controls.findIndex(x => x.value.id == event.value.value.id);
    this.shares.controls[index].get('selectedPayer').setValue(true);
    this.shares.controls[index].get('paid').setValue(paid);
  }

  getCurrencies(){
    this.subscription.add(
      this.userService.getCurrencies()
      .subscribe({
        next: (currencies: Currency[]) => {
          this.currencies = currencies;
        },
      })
    );
  }

  switchSplitType(event: SelectButtonChangeEvent){
    if (event.value == 'Equally'){
      const amount = this.expenseForm.get('amount').value;
      const baseShare = CommonService.round(amount, this.shares.controls.length);
      const sharesArray = this.getsharesArray(baseShare, amount, this.shares.controls.length);
      this.setOwedAmount(sharesArray);
      this.owedSum = 0;
    }
    else{
      this.shares.controls.forEach((control) => {
        control.get('owed').enable();
      });
    }
  }

  switchPayerType(event: SelectButtonChangeEvent){
    if (event.value == 'Single'){
      this.singlePayer = true;
      const index = this.shares.controls.findIndex(x => x.value.selectedPayer);
      const amount = this.expenseForm.get('amount').value;
      this.setPaidAmount(0);
      this.shares.controls[index].get('paid').setValue(amount);
      this.paidSum = 0;
    }
    else{
      this.singlePayer = false;
    }
  }

  onSave() {
    if (this.expenseForm.invalid) {
      this.notifier.warning('Form is invalid', 'Invalid');
      return;
    }

    const expense = this.setExpenseModel();

    if (this.editMode) {
      const comment = this.getComment(this.expense, expense)
      if (comment) {
        expense.comments = [ comment ];
        this.updateExpense(expense);
      }
      else{
        this.notifier.info('No Change in expense.')
        this.dialogRef.close();
      }
    } else {
      this.addExpense(expense);
    }
  }

  setExpenseModel(): Expense {
    const expense = {
      id: this.expense?.id || 0,
      date: this.expenseForm.get('date').value,
      title: this.expenseForm.get('desc').value,
      currency: this.currency,
      amount: parseFloat(this.expenseForm.get('amount').value),
      addedBy: this.currentUser,
      group: this.group,
      isSettlement: false,
      shares: [],
      comments: []
    } as Expense

    const users = this.expenseForm.get('selectedShares').value;

    for (let user of users) {
      const control = this.getFormControlById(user.id);
      if (control){
        const userShare: UserShare = {
          user: user,
          paid: parseFloat(control.get('paid').value || 0),
          owed: parseFloat(control.get('owed').getRawValue() || 0),
        };
        if (userShare.paid != 0 || userShare.owed != 0) expense.shares.push(userShare);
      }
    }

    return expense;
  }

  getFormControlById(id: number): FormControl | undefined {
    const control = this.shares.controls.find((c: FormGroup) => c.get('id').value == id) as FormControl;
    return control ? control : null;
  }

  addExpense(expense: Expense){
    this.isLoading = true;
    this.subscription.add(
      this.expenseService.add(expense)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((expenseId) => {
        if (expenseId) {
          expense.id = expenseId;
          if (this.fromGroup == expense.group.id){
            this.expenseBroadcastService.updateExpenseList = expense;
          }
          this.notifier.success('Expense added successfully.')
          this.mixpanel.log('Expense Added', { expenseId })
          this.dialogRef.close(true);
        }
      })
    );
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
            this.mixpanel.log('Expense Updated', { expenseId: this.expense.id })
            this.notifier.success('Expense updated successfully.')
            this.dialogRef.close(true);
          }
        })
    );
  }

  getComment(oldExpense: Expense, newExpense: Expense) {
    let comment = {
      addedBy: this.currentUser,
      isSystemComment: true,
      details: [],
    } as ExpenseComment;
    newExpense.shares.forEach((share) => {
      const oldShare = oldExpense.shares.find(
        (old) => old.user.id === share.user.id
      );
      if (oldShare) {
        const currency = oldExpense.currency;
        const oldOwe = CommonService.round(oldShare.owed);
        const newOwe = CommonService.round(share.owed);
        const oldPay = CommonService.round(oldShare.paid);
        const newPay = CommonService.round(share.paid);

        const createComment = (
          type: string,
          oldAmount: number,
          newAmount: number
        ) => {
          if (oldAmount === newAmount) return '';
          if (oldAmount === 0)
            return `${share.user.name.display}'s ${type} changed to ${currency.code} ${newAmount}`;
          if (newAmount === 0) return `${share.user.name.display}'s ${type} was removed`;
          return `${share.user.name.display}'s ${type} changed from ${currency.code} ${oldAmount} to ${currency.code} ${newAmount}`;
        };

        const oweComment = createComment('share', oldOwe, newOwe);
        const payComment = createComment('payment', oldPay, newPay);

        [oweComment, payComment].forEach((x) => {
          if (x) comment.details.push(x);
        });
      }
    });

    //compare expense date
    if (oldExpense.date !== newExpense.date){
      comment.details.push(`Expense date changed from ${this.tranformDate(oldExpense.date)} to ${this.tranformDate(newExpense.date)}`);
    }

    //compare expense title
    if (oldExpense.title !== newExpense.title){
      comment.details.push(`Expense Title changed from ${oldExpense.title} to ${newExpense.title}`);
    }

    //return null if there is no change
    return comment.details.length > 0 ? comment : null;
  }

  tranformDate(date: Date){
    return this.datePipe.transform(date, 'dd/MM/yyyy hh:mm:ss a');
  }

  subscribeToGroupChange(){
    this.subscription.add(
      this.expenseForm.get('group').valueChanges
      .subscribe(
        (group: Group) => {
          this.group = group;
          if (group.id === 0){ //no group case
            this.expenseForm.get('currency').enable();
            this.isCurrencyEditable = true;
            this.currency = this.currencies[0];
            this.expenseForm.get('currency').setValue(this.currency);
          } else {
            this.expenseForm.get('currency').disable();
            this.currency = group.currency;
            this.expenseForm.get('currency').setValue(this.currency.code);
          }
          this.users = this.group.users;
          this.setFormControls();
        }
      )
    )
  }

  subscribeToCurrencyChange(){
    this.subscription.add(
      this.expenseForm.get('currency').valueChanges
      .subscribe(
        (currency: Currency) => {
          this.currency = currency;
        }
      )
    )
  }

  onUserSelectionChange(event: any){
    const selected = !event.originalEvent.selected;
    const user = event.itemValue;
    if (event.value.length < 2){
      const newPayers = event.value;
      newPayers.push(user);
      this.expenseForm.get('selectedShares').setValue(newPayers);
      this.notifier.info('Please selected alteast 2 users.');
      return;
    }
    if (selected){
      this.shares.push(this.addShare(user));
    } else {
      const removedControl = this.shares.controls.find(x => x.value.id === user.id);
      this.shares.controls = this.shares.controls.filter(x => x.value.id !== user.id);

      if (removedControl.value.selectedPayer){
        this.shares.controls[0].get('selectedPayer').setValue(true);
        this.expenseForm.get('payer').setValue(this.shares.controls[0]);
        if (this.singlePayer){
          this.shares.controls[0].get('paid').setValue(removedControl.value.paid);
        }
      }
    }

    if (this.expenseForm.get('splitType').value == 'Equally'){
      const amount = this.expenseForm.get('amount').value;
      const baseShare = CommonService.round(amount, this.shares.controls.length);
      const sharesArray = this.getsharesArray(baseShare, amount, this.shares.controls.length);
      this.setOwedAmount(sharesArray);
    }
    else {
      this.checkAmount('owed');
    }
    this.checkAmount('paid');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
