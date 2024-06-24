import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { GroupService } from 'src/services/components/group.service';
import { AddGroupComponent } from '../add-group/add-group.component';
import { Group } from 'src/models/group.model';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    DynamicDialogModule,
    AvatarModule,
    RouterModule
  ],
  providers: [DialogService],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent implements OnInit, OnDestroy{
  groups: Group[] = [];
  subscription: Subscription
  selectedGroupId: number;
  ref: DynamicDialogRef | undefined;

  constructor(
    private groupService: GroupService,
    private router: Router,
    public dialogService: DialogService,
    private groupBroadcastService: GroupBroadcastService
  ){
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.getAllGroups();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getAllGroups(){
    this.subscription.add(
      this.groupService.getAll().subscribe({
        next:(groups : Group[])=>{
         this.groups = groups;
         this.subscribeToSelectedGroupId();
        }
      })
    )
  }

  subscribeToSelectedGroupId(){
    this.subscription.add(
      this.groupBroadcastService.selectedGroupId
      .subscribe({
        next:(groupId: number) => {
          this.selectedGroupId = groupId;
        }
      })
    )
  }
  getSelectedGroup(){
    this.subscription.add(
      this.groupBroadcastService.selectedGroup
      .subscribe(group => {
        let index = this.groups.findIndex(x => x.id === group.id);
        if (index !== -1) {
            this.groups[index] = group;
        }
      })
    )
  }

  navigateToGroup(group: Group) {
    this.router.navigate(['home/group', group.id]);
  }

  addGroup(){
    this.ref = this.dialogService.open(AddGroupComponent,{ 
      header: 'Add Group',
      width: '50vw',
      modal: true, 
      contentStyle: { overflow: 'auto' },
    });

    this.ref.onClose.subscribe(() => {
      this.getAllGroups();
    });
  }
}
