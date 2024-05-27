import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddGroupComponent } from 'src/app/standalone/add-group/add-group.component';
import { FriendshipStates } from 'src/app/shared/enums/friendship-status.enum';
import { GroupService } from 'src/services/components/group.service';
import { FriendsBroadcastService } from 'src/services/services/broadcast.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  constructor(
    private groupService: GroupService,
    private dialog: MatDialog,
    private friendsbroadcastService: FriendsBroadcastService
  ) {}
  groups: any[];
  friends: any[] = [];

  ngOnInit(): void {
    this.GetAllGroups();
    this.friendsbroadcastService.GetFriends();

    this.friendsbroadcastService.friends.subscribe({
      next: (friends: any[]) => {
        this.friends = friends.filter(x => x.Status == FriendshipStates.Accepted);
      }
    })
  }

  GetAllGroups() {
    this.groupService.GetAll().subscribe((res) => {
      this.groups = res;
    });
  }

  addGroup(): void {
    const dialogRef = this.dialog.open(AddGroupComponent, { width: '800px' });
    dialogRef.afterClosed().subscribe(() => {
      this.GetAllGroups();
    });
  }
}
