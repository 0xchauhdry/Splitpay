import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { AddSettleUpComponent } from 'src/shared/components/add-settle-up/add-settle-up.component';
import { Group } from 'src/shared/models/group.model';
import { SettleUpConfig } from 'src/shared/models/request/settle-up-config.model';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/services/auth/auth.service';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { GroupService } from 'src/services/components/group.service';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';

@Component({
  selector: 'app-group-balances',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    ButtonModule,
    TooltipModule,
    RouterModule
  ],
  providers:[
    DialogService
  ],
  templateUrl: './group-balances.component.html',
  styleUrl: './group-balances.component.scss'
})
export class GroupBalancesComponent implements OnInit, OnDestroy {
  loggedInUser: User;
  subscription: Subscription;
  tooltipOptions = {
    tooltipPosition: 'bottom',
    tooltipStyleClass: 'transformTooltip'
  };
  users: User[] = [];
  group: Group;

  constructor(
    private groupBroadcastService: GroupBroadcastService,
    private expenseBroadcastService: ExpenseBroadcastService,
    public dialogService: DialogService,
    private groupService: GroupService,
    private authService: AuthService,
  ){
    this.subscription = new Subscription();
  }
  ngOnInit(): void {
    this.getLoggedInUser();
    this.getSelectedGroup();
  }

  getLoggedInUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if(user) this.loggedInUser = user;
      })
    );
  }
  getSelectedGroup(){
    this.subscription.add(
      this.groupBroadcastService.selectedGroup
      .subscribe((group: Group) => {
        if (group){
          this.group = group;
          this.getGroupBalances();
        }
      })
    );
  }

  getGroupBalances(){
    this.subscription.add(
      this.groupService.getBalances(this.group.id).subscribe({
        next: (users: User[]) => {
          if (users && users.length > 0){
            this.users = users;
          }
        }
      })
    )
  }

  openSettleUpDialog(user: User){
    let payer = this.users.find(x => x.id === user.id);
    let receipent = this.users.find(x => x.id === this.loggedInUser.id);
    if (user.balance > 0){
      payer = this.users.find(x => x.id === this.loggedInUser.id);
      receipent = this.users.find(x => x.id === user.id);
    }

    const settleUpConfig  = {
      payer: payer,
      receipent: receipent,
      users: this.users,
      groupId: this.group.id,
      currency: this.group.currency,
      isEdit: false,
      fromComponent: 'Group Balance'
    } as SettleUpConfig;

    const dialogRef = this.dialogService.open(AddSettleUpComponent, {
      header: 'Settle Up',
      width: '600px',
      modal: true,
      data: settleUpConfig,
      contentStyle: { overflow: 'auto' },
      breakpoints: { '1199px': '75vw', '575px': '90vw' },
    });

    this.subscription.add(
      dialogRef.onClose.subscribe((update) => {
        if (update){
          this.expenseBroadcastService.updateBalance = true;
          this.getGroupBalances();
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
