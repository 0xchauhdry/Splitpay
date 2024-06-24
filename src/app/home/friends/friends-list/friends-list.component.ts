import { Component, OnDestroy, OnInit } from '@angular/core';
import { AddFriendComponent } from 'src/app/home/friends/add-friend/add-friend.component';
import { FriendsBroadcastService } from 'src/services/broadcast/friend-broadcast.service';
import { FriendshipStates } from 'src/models/enums/friendship-status.enum';
import { FriendService } from 'src/services/components/friend.service';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from 'src/models/user.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { Friend } from 'src/models/friend.model';
import { NotifierService } from 'src/services/services/notifier.service';
import { ImageService } from 'src/services/common/image.service';
import { UserService } from 'src/services/components/user.service';
import { Image } from '../../../../models/image.model';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';

@Component({
  selector: 'app-friends-list',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    TabViewModule,
    TooltipModule,
    DynamicDialogModule,
  ],
  providers:[
    DialogService
  ],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.scss'
})
export class FriendsListComponent implements OnInit, OnDestroy {
  allfriends: Friend[] = [];
  friends: Friend[] = [];
  requests: Friend[] = [];
  requested: Friend[] = [];
  subscription: Subscription;
  ref: DynamicDialogRef | undefined;
  userId: number = 0;
  constructor(
    private friendsBroadcastService: FriendsBroadcastService,
    private friendService: FriendService,
    private authService: AuthService,
    private dialogService: DialogService,
    private notifier: NotifierService,
    private imageService: ImageService,
    private userService: UserService,
    private loader: LoaderService,
    private mixpanel: MixpanelService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.authService.user$.subscribe({
      next: (user: User) => {
        if(user) this.userId = user.id
      }
    })
    //this.friendsBroadcastService.getFriends();
    this.friendsBroadcastService.friends.subscribe((friends: Friend[]) => {
      this.allfriends = friends;
      this.filterFriends();
    });
  }

  filterFriends() {
    this.friends = this.allfriends.filter(
      (user) => user.status === FriendshipStates.Accepted
    );

    this.requests = this.allfriends.filter(
      (user) =>
        user.status === FriendshipStates.Requested && user.isRequester  
    );
    this.requested = this.allfriends.filter(
      (user) =>
        user.status === FriendshipStates.Requested && !user.isRequester
    );
  }

  addFriend(): void {
    this.ref = this.dialogService.open(AddFriendComponent, { header: 'Add Friend'});
    this.ref.onClose.subscribe((refresh: boolean) => {
      if (refresh) { 
        this.friendsBroadcastService.getFriends();
       }
    });
  }

  acceptRequest(friend: Friend) {
    this.friendService.AcceptRequest(friend.friendshipId, friend.id)
    .subscribe({
      next: async () => {
        this.mixpanel.log('Request Accepted', { userId: friend.id })
        this.notifier.success('Friend Request accepted successfully.');
        let updatedFriend = this.allfriends.find(x => x.id === friend.id);
        updatedFriend.status = FriendshipStates.Accepted;
        this.getImageUrl(updatedFriend);
        this.friendsBroadcastService.friends = this.allfriends;
      },
    });
  }

  rejectRequest(friend: Friend) {
    this.friendService.CancelRequest(friend.friendshipId, FriendshipStates.Rejected)
    .subscribe({
      next: () => {
        this.mixpanel.log('Request Rejected', { userId: friend.id })
        this.notifier.success('Friend Request rejected.');
        let updatedFriends = this.allfriends.filter(x => x.id !== friend.id);
        this.friendsBroadcastService.friends = updatedFriends;
      },
    });
  }

  cancelRequest(friend: Friend) {
    this.friendService.CancelRequest(friend.friendshipId, FriendshipStates.Cancelled)
    .subscribe({
      next: () => {
        this.mixpanel.log('Request Cancelled', { userId: friend.id })
        this.notifier.success('Friend Request cancelled.');
        let updatedFriends = this.allfriends.filter(x => x.id !== friend.id);
        this.friendsBroadcastService.friends = updatedFriends;
      },
    });
  }

  getImageUrl(updatedFriend: Friend){
    this.userService.getUserImage(updatedFriend.id).subscribe({
      next: (image: Image) => {
        if (image) {
          updatedFriend.imageUrl = this.imageService.imageToSafeUrl(image);
        }
        else{
          updatedFriend.imageUrl = '';
        }
      },
    });
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
