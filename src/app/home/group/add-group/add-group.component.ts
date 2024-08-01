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
import { Group } from 'src/shared/models/group.model';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FriendshipStates } from 'src/shared/models/enums/friendship-status.enum';
import { NotifierService } from 'src/services/services/notifier.service';
import { Subscription, finalize } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/shared/models/user.model';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Friend } from 'src/shared/models/friend.model';
import { Currency } from 'src/shared/models/currency.model';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { UserService } from 'src/services/components/user.service';
import { getFriends } from 'src/store/selectors';
import { Store } from '@ngrx/store';
import { GroupType } from 'src/shared/models/enums/group-type.enum';

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
  providers:[
    UserService
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
  isLoading: boolean = false;
  groupTypes = Object.keys(GroupType).map(key => ({
    label: GroupType[key as keyof typeof GroupType],
    value: key
  }));

  constructor(
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private authService: AuthService,
    private userService: UserService,
    private notifierService: NotifierService,
    private dialogRef: DynamicDialogRef<AddGroupComponent>,
    private mixpanel: MixpanelService,
    private store: Store
  ) {
    this.subscription = new Subscription();
    this.addGroupForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(5)]),
      type: new FormControl(this.groupTypes[0], Validators.required),
      description: new FormControl('', Validators.maxLength(100)),
      users: new FormControl('', Validators.required),
      currency: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.getCurrentUser();

    this.subscription.add(
      this.userService.getCurrencies()
      .subscribe({
        next: (currencies: Currency[]) => {
          this.currencies = currencies;
          this.addGroupForm.get('currency').setValue(this.currencies[0]);
        },
      })
    );

    this.subscription.add(
      this.store.select(getFriends).subscribe({
        next: (res: Friend[]) => {
          this.friends = res.filter(x => x.status == FriendshipStates.Accepted);
        }
      })
    )
  }
  
  getCurrentUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.loggedInUser = user;
      })
    );
  }

  addGroup() {
    if (this.addGroupForm.invalid){
      this.notifierService.error('Form is invalid.');
    } 
    else
    {
      const group = {
        name: this.addGroupForm.get('name').value,
        description: this.addGroupForm.get('description').value,
        users: this.addGroupForm.get('users').value,
        currency: this.addGroupForm.get('currency').value,
        createdBy: this.loggedInUser
      } as Group

      this.isLoading = true;
      this.subscription.add(
        this.groupService.add(group)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: () => {
            this.mixpanel.log('Group Created', { groupId: group.id })
            this.notifierService.success('Group Created Successfully')
            this.dialogRef.close(true);
          },
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
