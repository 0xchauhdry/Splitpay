import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription, finalize } from 'rxjs';
import { Currency } from 'src/models/currency.model';
import { Friend } from 'src/models/friend.model';
import { Group } from 'src/models/group.model';
import { GroupRequest } from 'src/models/request/group.request.model';
import { User } from 'src/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { CurrencyBroadcastService } from 'src/services/broadcast/currency-broadcast.service';
import { FriendsBroadcastService } from 'src/services/broadcast/friend-broadcast.service';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { GroupService } from 'src/services/components/group.service';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { NotifierService } from 'src/services/services/notifier.service';

@Component({
  selector: 'app-group-settings',
  standalone: true,
  imports: [
    AvatarModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    ButtonModule,
    TooltipModule,
    RouterModule
  ],
  templateUrl: './group-settings.component.html',
  styleUrl: './group-settings.component.scss'
})
export class GroupSettingsComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  group: Group;
  friends: Friend[] = [];
  editGroupForm: FormGroup;
  otherFriends: User[] = [];
  currentGroupUsers: User[] = [];
  loggedInUser: User;
  constructor(private groupBroadcastService: GroupBroadcastService,
    private friendBroadcastService: FriendsBroadcastService,
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private notifier: NotifierService,
    private authService: AuthService,
    private currencyService: CurrencyBroadcastService,
    private loader: LoaderService,
    private mixpanel: MixpanelService
  ){
    this.subscription = new Subscription();
  }
  ngOnInit(): void {
    this.editGroupForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(5)]),
      description: new FormControl(''),
      currency: new FormControl('', Validators.required),
      newUsers: new FormControl('', Validators.required),
    });
    this.getLoggedInUser();
    this.subscribeToFriends();
    this.subscribeToSelectedGroup();
  }

  getLoggedInUser(){
    this.authService.user$.subscribe({
      next: (user: User) => {
        if(user){
          this.loggedInUser = user;
        }
      }
    });
  }

  getCurrencies(){
    this.subscription.add(
      this.currencyService.currencies.subscribe({
        next: (currencies: Currency[]) => {
          if(currencies && currencies.length){
            this.group.currency = currencies.find(x => x.id === this.group.currency?.id)
          }
        }
      })
    )
  }

  subscribeToFriends(){
    this.subscription.add(
      this.friendBroadcastService.friends.subscribe({
        next: (friends : Friend[]) => {
          this.friends = friends;
          if(!this.otherFriends.length && this.currentGroupUsers.length){
            this.otherFriends = this.friends.filter(friend => 
              !this.currentGroupUsers.some(user => user.id === friend.id)
            );
          }
        }
      })
    )
  }

  subscribeToSelectedGroup(){
    this.subscription.add(
      this.groupBroadcastService.selectedGroup.subscribe({
        next: (group) => {
          if(group){
            this.group = group;
            this.currentGroupUsers = [...this.group.users];
            if(!this.otherFriends.length && this.currentGroupUsers.length){
              this.otherFriends = this.friends.filter(friend => 
                !this.currentGroupUsers.some(user => user.id === friend.id)
              );
            }
            this.getCurrencies();
            this.setFormControl();
          }
        }
      })
    )
  }

  setFormControl(){
    this.editGroupForm.get('name').setValue(this.group.name);
    this.editGroupForm.get('description').setValue(this.group.description);
    this.editGroupForm.get('currency').setValue(this.group.currency);
  }

  getGroupInfo(groupId: number) {
    this.groupService.get(groupId)
    .subscribe((group: Group) => {
      this.group = group;
      this.groupBroadcastService.selectedGroup = this.group;
    });
  }

  onSave(){
    const groupRequest: GroupRequest = this.fillGroupRequest();
    this.loader.show();
    this.subscription.add(
      this.groupService.update(groupRequest)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: () => {
          this.mixpanel.log('Group Updated', { groupId: groupRequest.id })
          this.notifier.success('Group Details Updated.');
          this.getGroupInfo(this.group.id);
        }
      })
    )
  }

  removeUser(user: User){
    this.otherFriends.push(user);
    this.currentGroupUsers = this.currentGroupUsers.filter(x => x.id != user.id)
  }

  addUsers(){
    const userControl = this.editGroupForm.get('newUsers');
    const users = userControl.value;
    userControl.reset();

    if(users && users?.length){
      this.currentGroupUsers = [...users, ...this.currentGroupUsers];
      this.otherFriends = this.otherFriends.filter(friend => 
        !this.currentGroupUsers.some(user => user.id === friend.id)
      );
    }
  }

  fillGroupRequest() : GroupRequest {
    let groupRequest = {
      id: this.group.id,
      name: this.editGroupForm.get('name').value,
      description: this.editGroupForm.get('description').value,
      currency: this.group.currency,
      actionBy: this.loggedInUser
    } as GroupRequest;
    groupRequest = this.setUsersLists(groupRequest);
    return groupRequest;
  }

  setUsersLists(groupRequest: GroupRequest ) : GroupRequest{
    this.addUsers();
    groupRequest.addedUsers = this.currentGroupUsers.filter(friend => 
      !this.group.users.some(user => user.id === friend.id)
    );
    groupRequest.removedUsers = this.group.users.filter(friend => 
      !this.currentGroupUsers.some(user => user.id === friend.id)
    );

    return groupRequest;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

