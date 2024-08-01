import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { AddGroupComponent } from '../add-group/add-group.component';
import { Group } from 'src/shared/models/group.model';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { AvatarModule } from 'primeng/avatar';
import { Store } from '@ngrx/store';
import { getGroups } from 'src/store/selectors';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FETCH_GROUPS, setGroups } from 'src/store/actions';
import { GroupService } from 'src/services/components/group.service';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    DynamicDialogModule,
    AvatarModule,
    RouterModule,
    CardModule
  ],
  providers: [
    DialogService
  ],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit, OnDestroy{
  groups: Group[] = [];
  subscription: Subscription
  selectedGroupId: number = 0;
  loggedInUser: User;
  tooltipOptions = {
    tooltipPosition: 'bottom',
    tooltipStyleClass: 'transformTooltip'
  };

  constructor(
    private router: Router,
    public dialogService: DialogService,
    private groupBroadcastService: GroupBroadcastService,
    private store: Store,
    private groupService: GroupService,
    private authService: AuthService,
    private expenseBroadcastService: ExpenseBroadcastService
  ){
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.getLoggedInUser();
    this.getAllGroups();
    this.subscribeToSelectedGroup();
    this.subscribeToUpdateBalance();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  getLoggedInUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.loggedInUser = user;
      })
    );
  }

  subscribeToSelectedGroup(){
    this.subscription.add(
      this.groupBroadcastService.selectedGroup
      .subscribe(group => {
        if (group && this.selectedGroupId != group.id){
          this.selectedGroupId = group.id;
        } 
      })
    )
  }

  subscribeToUpdateBalance(){
    this.subscription.add(
      this.expenseBroadcastService.updateBalance
      .subscribe((value) => {
        if (value){
          this.getSelectedGroupBalance();
        }
      })
    )
  }

  getAllGroups(){
    this.subscription.add(
      this.store.select(getGroups)
      .subscribe((groups: Group[]) => {
        if(groups && groups.length > 0) this.groups = groups;
      })
    )
  }

  getSelectedGroupBalance(){
    this.subscription.add(
      this.groupService
      .getBalances(this.selectedGroupId)
      .subscribe((users: User[]) => {
        if (users && users.length > 0){
          const user = users.find(x => x.id === this.loggedInUser?.id);
          if (user){
            const index = this.groups.findIndex(x => x.id === this.selectedGroupId);
            if (index > -1){
              const updatedGroups = this.groups
              .map(group => 
                group.id === this.selectedGroupId 
                  ? { ...group, balance: user.balance } 
                  : group
              );
              this.groups = updatedGroups;
            }
          }
        }
      })
    )
  }

  navigateToGroup(group: Group) {
    this.router.navigate(['home/group', group.id]);
  }

  addGroup(){
    const dialogRef = this.dialogService.open(AddGroupComponent,{ 
      header: 'Add Group',
      width: '50vw',
      modal: true, 
      contentStyle: { overflow: 'auto' },
    });

    this.subscription.add(
      dialogRef.onClose.subscribe((refresh) => {
        if(refresh) this.store.dispatch(FETCH_GROUPS());
      })
    );
  }
}
