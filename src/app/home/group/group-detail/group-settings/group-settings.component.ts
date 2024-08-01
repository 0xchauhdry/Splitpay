import { Component, OnDestroy, OnInit } from '@angular/core';
import { 
   FormBuilder,
   FormControl,
   FormGroup, 
   FormsModule, 
   ReactiveFormsModule, 
   Validators 
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription, finalize } from 'rxjs';
import { Friend } from 'src/shared/models/friend.model';
import { Group } from 'src/shared/models/group.model';
import { GroupRequest } from 'src/shared/models/request/group.request.model';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { GroupService } from 'src/services/components/group.service';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { NotifierService } from 'src/services/services/notifier.service';
import { FETCH_GROUPS } from 'src/store/actions';
import { getFriends } from 'src/store/selectors';

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
  tooltipOptions = {
    tooltipPosition: 'bottom',
    tooltipStyleClass: 'transformTooltip'
  };
  
  constructor(
    private groupBroadcastService: GroupBroadcastService,
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private notifier: NotifierService,
    private authService: AuthService,
    private loader: LoaderService,
    private mixpanel: MixpanelService,
    private store: Store,
    private router: Router,
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
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if(user) this.loggedInUser = user;
      })
    );
  }

  subscribeToFriends(){
    this.subscription.add(
      this.store.select(getFriends)
      .subscribe({
        next: (friends : Friend[]) => {
          if (friends && friends.length > 0){
            this.friends = friends;
            if(!this.otherFriends.length && this.currentGroupUsers.length){
              this.otherFriends = this.friends.filter(friend => 
                !this.currentGroupUsers.some(user => user.id === friend.id)
              );
            }
          }
        }
      })
    )
  }

  subscribeToSelectedGroup(){
    this.subscription.add(
      this.groupBroadcastService.selectedGroup
      .subscribe({
        next: (group) => {
          if(group){
            this.group = group;
            this.currentGroupUsers = [...this.group.users];
            if(!this.otherFriends.length && this.currentGroupUsers.length){
              this.otherFriends = this.friends.filter(friend => 
                !this.currentGroupUsers.some(user => user.id === friend.id)
              );
            }
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

  async updateGroups(group: Group) {
    this.groupBroadcastService.selectedGroup = group;
    this.store.dispatch(FETCH_GROUPS());
  }

  getGroupInfo(groupId: number) {
    this.groupService.get(groupId)
    .subscribe((group: Group) => {
      this.updateGroups(group);
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

  deleteGroup(){
    this.loader.show();
    this.subscription.add(
      this.groupService.delete(this.group.id)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: () => {
          this.mixpanel.log('Group Deleted', { groupId: this.group.id })
          this.notifier.success('Group Deleted.');
          this.groupBroadcastService.selectedGroup = null;
          this.store.dispatch(FETCH_GROUPS());
          this.router.navigate(['../home/group']);
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

