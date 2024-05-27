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
import { Group } from 'src/app/shared/models/group.model';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonService } from 'src/services/common/common.service';
import { UserService } from 'src/services/components/user.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FriendService } from 'src/services/components/friend.service';
import { FriendsBroadcastService } from 'src/services/services/broadcast.service';
import { FriendshipStates } from 'src/app/shared/enums/friendship-status.enum';
import { NotifierService } from 'src/services/services/notifier.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-group',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    DropdownModule,
    InputTextModule,
    MultiSelectModule
  ],
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss'],
})
export class AddGroupComponent implements OnInit, OnDestroy {
  users: any[] = [{UserId: 1, FirstName: 'Sohaib', LastName: 'Malik'}];
  currencies: any[];
  addGroupForm: FormGroup;
  loggedInUser: any;
  subscription: Subscription;
  constructor(
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private commonService: CommonService,
    private userService: UserService,
    private friendBroadcastService: FriendsBroadcastService,
    private notifierService: NotifierService,
    public dialogRef: MatDialogRef<AddGroupComponent>
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

    this.subscription.add(
      this.commonService.GetLoggedInUser().subscribe((user) => {
        this.loggedInUser = user.user;
      })
    );
    this.GetCurrencies();

    this.subscription.add(
      this.friendBroadcastService.friends.subscribe({
        next: (res: any[]) => {
          this.users = res.filter(x => x.Status == FriendshipStates.Accepted);
        }
      })
    )
  }

  GetCurrencies() {
    this.subscription.add(
      this.userService.GetCurrencies().subscribe({
        next: (res: any[]) => {
          this.currencies = res;
          this.addGroupForm.get('Currency').setValue(this.currencies[0]);
        },
      })
    );
  }

  AddGroup() {
    if (this.addGroupForm.valid) {
      const group = new Group();
      group.Name = this.addGroupForm.get('Name').value;
      group.Description = this.addGroupForm.get('Description').value;
      group.Users = this.addGroupForm.get('Users').value;
      group.CurrencyId = this.addGroupForm.get('Currency').value.CurrencyId;
      group.CreatedBy = this.loggedInUser.UserId;

      this.subscription.add(
        this.groupService.Add(group).subscribe({
          next: (res: any) => {
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
