import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from 'src/services/components/group.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Group } from 'src/models/group.model';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { FriendsBroadcastService } from 'src/services/broadcast/friend-broadcast.service';
import { FriendshipStates } from 'src/models/enums/friendship-status.enum';
import { NotifierService } from 'src/services/services/notifier.service';
import { Subscription, finalize } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/models/user.model';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Friend } from 'src/models/friend.model';
import { CurrencyBroadcastService } from 'src/services/broadcast/currency-broadcast.service';
import { Currency } from 'src/models/currency.model';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';

@Component({
  selector: 'app-add-group',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    AutoCompleteModule,
    MultiSelectModule
  ],
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss'],
})
export class AddGroupComponent implements OnInit, OnDestroy {
  friends: Friend[] = [];
  currencies: any[];
  addGroupForm: FormGroup;
  loggedInUser: User;
  subscription: Subscription;
  filteredCurrencies: any[];
  constructor(
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private authService: AuthService,
    private currencyService: CurrencyBroadcastService,
    private friendBroadcastService: FriendsBroadcastService,
    private notifierService: NotifierService,
    private dialogRef: DynamicDialogRef<AddGroupComponent>,
    private loader: LoaderService,
    private mixpanel: MixpanelService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.addGroupForm = this.formBuilder.group({
      Name: new FormControl('', [Validators.required, Validators.minLength(5)]),
      Description: new FormControl(''),
      Users: new FormControl('', Validators.required),
      Currency: new FormControl('', Validators.required),
    });

    this.authService.user$.subscribe({
      next: (user: User) => {
        if(user){
          this.loggedInUser = user;
        }
      }
    });

    this.subscription.add(
      this.currencyService.currencies.subscribe({
        next: (currencies: Currency[]) => {
          this.filteredCurrencies = this.currencies = currencies;
          this.addGroupForm.get('Currency').setValue(this.currencies[0]);
        },
      })
    );

    this.subscription.add(
      this.friendBroadcastService.friends.subscribe({
        next: (res: Friend[]) => {
          this.friends = res.filter(x => x.status == FriendshipStates.Accepted);
        }
      })
    )
  }

  filterCurrency(event: AutoCompleteCompleteEvent) {
      let filtered: any[] = [];
      let query = event.query;

      for (let i = 0; i < this.currencies.length; i++) {
          let currency = this.currencies[i];
          if (currency.code.toLowerCase().indexOf(query.toLowerCase().trim()) == 0) {
              filtered.push(currency);
          }
      }
      this.filteredCurrencies = filtered;
  }

  onClear(){
    this.filteredCurrencies = this.currencies;
  }

  AddGroup() {
    if (this.addGroupForm.invalid){
      this.notifierService.error('Form is invalid.');
    } 
    else
    {
      const group = {
        name: this.addGroupForm.get('Name').value,
        description: this.addGroupForm.get('Description').value,
        users: this.addGroupForm.get('Users').value,
        currency: this.addGroupForm.get('Currency').value,
        createdBy: this.loggedInUser
      } as Group

      this.loader.show()
      this.subscription.add(
        this.groupService.add(group)
        .pipe(
          finalize(() => {
            this.loader.hide();
          })
        )
        .subscribe({
          next: () => {
            this.mixpanel.log('Group Created', { groupId: group.id })
            this.notifierService.success('Group Created Successfully')
            this.dialogRef.close();
          },
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
