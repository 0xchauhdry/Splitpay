import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddExpenseComponent } from 'src/app/home/expense/add-expense/add-expense.component';
import { GroupService } from 'src/services/components/group.service';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { AddGroupComponent } from '../add-group/add-group.component';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/models/user.model';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { Group } from 'src/models/group.model';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { ExpenseModel, ExpensesModel } from 'src/models/expense.model';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DynamicDialogModule,
    GroupDetailComponent,
    AddGroupComponent,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    RouterOutlet,
    RouterModule
  ],
  providers: [DialogService],
})

export class GroupDetailComponent implements OnInit, OnDestroy {
  group: Group | null;
  user: User;
  ref: DynamicDialogRef | undefined;
  subscription: Subscription;
  groupId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    public dialogService: DialogService,
    private authService: AuthService,
    private groupBroadcastService: GroupBroadcastService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.getLoggedInUser();

    this.route.paramMap.subscribe(params => {
      this.groupId = +params.get('groupId');
      this.groupBroadcastService.selectedGroupId = this.groupId;
      this.getGroupInfo(this.groupId);
    });
    
    this.getSelectedGroup();
  }

  getLoggedInUser(){
    this.subscription.add(
      this.authService.user$.subscribe({
        next: (user: User) => {
          if (user){
            this.user = user;
          }
        }
      })
    );
  }

  getSelectedGroup(){
    this.subscription.add(
      this.groupBroadcastService.selectedGroup
      .subscribe(group => {
        this.group = group;
      })
    )
  }

  getGroupInfo(groupId: number) {
    this.subscription.add(
      this.groupService.get(groupId)
      .subscribe((group: Group) => {
        this.groupBroadcastService.selectedGroup = group;
      })
    );
  }

  showExpenseDialog() {
    this.ref = this.dialogService.open(AddExpenseComponent, {
      header: 'Add Expense',
      width: '60vw',
      modal: true,
      contentStyle: { overflow: 'auto' },
      data: { group: this.group },
      breakpoints: { '1199px': '75vw', '575px': '90vw' },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
