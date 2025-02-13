import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddExpenseComponent } from 'src/shared/components/add-expense/add-expense.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { AddGroupComponent } from '../add-group/add-group.component';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/shared/models/user.model';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { Group } from 'src/shared/models/group.model';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { Store } from '@ngrx/store';
import { getGroups } from 'src/store/selectors';
import { AddSettleUpComponent } from 'src/shared/components/add-settle-up/add-settle-up.component';
import { SettleUpConfig } from 'src/shared/models/request/settle-up-config.model';
import { CardModule } from 'primeng/card';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { GetExpenseRequest } from 'src/shared/models/request/get-expense.request.model';
import { CommonService } from 'src/services/common/common.service';

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
    RouterModule,
    CardModule,
    CheckboxModule,
    CalendarModule,
    ReactiveFormsModule
  ],
  providers: [DialogService],
})

export class GroupDetailComponent implements OnInit, OnDestroy {
  group: Group | null;
  user: User;
  subscription: Subscription;
  groupId: number;
  tooltipOptions = {
    tooltipPosition: 'bottom',
    tooltipStyleClass: 'transformTooltip'
  };
  filterForm: FormGroup;
  currentFilters: GetExpenseRequest = new GetExpenseRequest(1, 10);
  showFilters: boolean;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    public dialogService: DialogService,
    private authService: AuthService,
    private groupBroadcastService: GroupBroadcastService,
    private expenseBroadcastService: ExpenseBroadcastService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.getLoggedInUser();
    this.filterForm = new FormGroup({
      dateRange: new FormControl(''),
      involvedMe: new FormControl(false)
    });

    this.subscribeToRoute();
    this.subscribeToShowFilters();
  }

  subscribeToRoute(){
    this.subscription.add(
      this.route.paramMap
      .subscribe(params => {
         let groupId = +params.get('groupId');
         if (groupId !== this.group?.id || 0){
          this.filterForm.patchValue({
            dateRange: new FormControl(''),
            involvedMe: new FormControl(false)
          })
          this.getGroup(groupId);
         }
      })
    );
  }

  subscribeToShowFilters(){
    this.groupBroadcastService.showFilters.subscribe((show) => {
      this.showFilters = show;
      if(!this.showFilters){
        this.filterForm.patchValue({
          dateRange: new FormControl(''),
          involvedMe: new FormControl(false)
        })
      }
    })
  }

  dateClose(){
    let [startDate, endDate] = this.filterForm.get('dateRange').value;
    if(this.currentFilters.dateRange.startDate !== startDate || this.currentFilters.dateRange.endDate !== endDate){
      this.currentFilters.dateRange.startDate = startDate ? CommonService.setStartDate(startDate) : null;
      this.currentFilters.dateRange.endDate = endDate ? CommonService.setEndDate(endDate) : null;
      this.groupBroadcastService.selectedFilters = this.currentFilters;
    }
  }

  checkboxChange(event: CheckboxChangeEvent){
    this.currentFilters.involved = event.checked;
    this.groupBroadcastService.selectedFilters = this.currentFilters;
  }

  getLoggedInUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.user = user;
      })
    );
  }

  getGroup(groupId: number) {
    this.subscription.add(
      this.store.select(getGroups)
      .subscribe((groups: Group[]) => {
        if(groups && groups.length > 0){
          this.group = groups.find(x => x.id === groupId);
          this.groupBroadcastService.selectedGroup = this.group;
        }
      })
    );
  }

  showExpenseDialog() {
    const dialogRef = this.dialogService.open(AddExpenseComponent, {
      header: 'Add Expense',
      width: '60vw',
      modal: true,
      data: { expense: null, groupId: this.group.id },
      contentStyle: { overflow: 'auto' },
      breakpoints: { '1199px': '75vw', '575px': '90vw' },
    });

    this.subscription.add(
      dialogRef.onClose.subscribe((result: boolean) => {
        if (result){
          this.expenseBroadcastService.updateBalance = true;
        }
      })
    )
  }

  showSettleUpDialog() {
    const settleUpConfig  = {
      payer: this.group.users[0],
      receipent: this.group.users[1],
      users: this.group.users,
      groupId: this.group.id,
      currency: this.group.currency,
      isEdit: false,
      fromComponent: 'Group Header'
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
      dialogRef.onClose.subscribe((result: boolean) => {
        if (result){
          this.expenseBroadcastService.updateBalance = true;
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}


