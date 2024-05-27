import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddFriendComponent } from 'src/app/standalone/add-friend/add-friend.component';
import { FriendsBroadcastService } from 'src/services/services/broadcast.service';
import { FriendshipStates } from 'src/app/shared/enums/friendship-status.enum';
import { Store } from '@ngrx/store';
import { getUser } from 'src/services/auth/user.state';
import { FriendService } from 'src/services/components/friend.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
})
export class FriendsComponent implements OnInit {
  allfriends: any[] = [];
  friends: any[] = [];
  requests: any[] = [];
  requested: any[] = [];

  constructor(
    private friendsBroadcastService: FriendsBroadcastService,
    private dialog: MatDialog,
    private friendService: FriendService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.friendsBroadcastService.friends.subscribe((data) => {
      this.allfriends = data;
      this.filterFriends();
    });
  }

  filterFriends() {
    this.friends = this.allfriends.filter(
      (user) => user.Status === FriendshipStates.Accepted
    );

    this.store
      .select(getUser)
      .subscribe({
        next: (data: any) => {
          let userId = data.user.UserId;
          this.requests = this.allfriends.filter(
            (user) =>
              user.Status === FriendshipStates.Requested && user.UserId != userId
          );
          this.requested = this.allfriends.filter(
            (user) =>
              user.Status === FriendshipStates.Requested && user.UserId == userId
          );
        },
      });
  }

  addFriend(): void {
    const dialogRef = this.dialog.open(AddFriendComponent, { width: '800px' });
    dialogRef.afterClosed().subscribe((reload: boolean) => {
      if (reload) {
        this.friendsBroadcastService.GetFriends();
      }
    });
  }

  acceptRequest(user: any) {
    this.friendService.UpdateRequest(user.FriendshipID, FriendshipStates.Accepted)
    .subscribe({
      next: () => {
        this.friendsBroadcastService.GetFriends();
      },
    });
  }

  rejectRequest(user: any) {
    this.friendService.CancelRequest(user.FriendshipID, FriendshipStates.Rejected)
    .subscribe({
      next: () => {
        this.friendsBroadcastService.GetFriends();
      },
    });
  }

  cancelRequest(user: any) {
    this.friendService.CancelRequest(user.FriendshipID, FriendshipStates.Cancelled)
    .subscribe({
      next: () => {
        this.friendsBroadcastService.GetFriends();
      },
    });
  }
}
