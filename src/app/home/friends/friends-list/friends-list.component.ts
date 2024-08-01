import { Component, OnDestroy, OnInit } from '@angular/core';
import { AddFriendComponent } from 'src/app/home/friends/add-friend/add-friend.component';
import { FriendshipStates } from 'src/shared/models/enums/friendship-status.enum';
import { FriendService } from 'src/services/components/friend.service';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from 'src/shared/models/user.model';
import { Subscription, finalize } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { Friend } from 'src/shared/models/friend.model';
import { NotifierService } from 'src/services/services/notifier.service';
import { ImageService } from 'src/services/common/image.service';
import { UserService } from 'src/services/components/user.service';
import { Image } from 'src/shared/models/image.model';
import { LoaderService } from 'src/services/services/loader.service';
import { MixpanelService } from 'src/services/services/mixpanel.service';
import { getFriends } from 'src/store/selectors';
import { Store } from '@ngrx/store';
import { FETCH_FRIENDS, setFriends } from 'src/store/actions';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BadgeModule } from 'primeng/badge';

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
    CardModule,
    RouterModule,
    BadgeModule
  ],
  providers:[
    DialogService,
    UserService
  ],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.scss'
})
export class FriendsListComponent implements OnInit, OnDestroy {
  allfriends: Friend[] = [];
  filteredFriends: Friend[] = [];
  activeFilter: string = '';
  subscription: Subscription;
  ref: DynamicDialogRef | undefined;
  userId: number = 0;
  tooltipOptions = {
    tooltipPosition: 'bottom',
    tooltipStyleClass: 'transformTooltip'
  };

  constructor(
    private friendService: FriendService,
    private authService: AuthService,
    private dialogService: DialogService,
    private notifier: NotifierService,
    private imageService: ImageService,
    private userService: UserService,
    private loader: LoaderService,
    private mixpanel: MixpanelService,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.getAllFriends();
  }

  subscribeToQueryParams(){
    this.route.queryParams.subscribe(params => {
      const filter = params['filter'];
      if (filter != this.activeFilter) this.applyFilter(filter);
    });
  }
  
  getCurrentUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.userId = user.id;
      })
    );
  }

  getAllFriends(){
    this.subscription.add(
      this.store.select(getFriends)
      .subscribe((friends: Friend[]) => {
        if (friends && friends.length > 0){
          this.allfriends = friends;
          this.applyFilter(null);
          this.subscribeToQueryParams();
        }
      })
    );
  }

  applyFilter(filter: string) {
    if (!filter || filter == this.activeFilter){
      this.filteredFriends = this.allfriends.filter(
        (user) => user.status === FriendshipStates.Accepted
      );
      this.activeFilter = '';
      this.router.navigate([], {
        queryParams: {},
      });
    }
    else{
      if(filter == 'requests'){
        this.filteredFriends = this.allfriends.filter(
          (user) => user.status === FriendshipStates.Requested && user.isRequester
        );
      }
      else{
        this.filteredFriends = this.allfriends.filter(
          (user) => user.status === FriendshipStates.Requested && !user.isRequester
        );
      }
      this.activeFilter = filter;
      this.router.navigate([], {
        queryParams: { filter: this.activeFilter },
      });
    } 
  }

  addFriend(): void {
    this.ref = this.dialogService.open(AddFriendComponent, { header: 'Add Friend'});

    this.subscription.add(
      this.ref.onClose.subscribe((refresh: boolean) => {
        if (refresh) {
          this.store.dispatch(FETCH_FRIENDS());
          if (this.activeFilter !== 'requested') {       
            this.router.navigate([], {
              queryParams: { filter: 'requested' },
            });
          }
        }
      })
    );
  }

  acceptRequest(friend: Friend) {
    this.loader.show();
    this.subscription.add(
      this.friendService.AcceptRequest(friend.friendshipId, friend.id)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: async () => {
          this.mixpanel.log('Request Accepted', { userId: friend.id })
          this.notifier.success('Friend Request accepted successfully.');
          const index = this.allfriends.findIndex(x => x.id === friend.id);
          if (index !== -1) {
            this.allfriends = [
              ...this.allfriends.slice(0, index),
              { ...this.allfriends[index], status: FriendshipStates.Accepted },
              ...this.allfriends.slice(index + 1)
            ];
          }
          this.getImageUrl(this.allfriends[index]);
          this.store.dispatch(setFriends({ friends: this.allfriends }));
          if (this.activeFilter !== '') this.applyFilter(null)
        },
      })
    );
  }

  rejectRequest(friend: Friend) {
    this.loader.show();
    this.subscription.add(
      this.friendService.CancelRequest(friend.friendshipId, FriendshipStates.Rejected)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: () => {
          this.mixpanel.log('Request Rejected', { userId: friend.id })
          this.notifier.success('Friend Request rejected.');
          this.allfriends = this.allfriends.filter(x => x.id !== friend.id);
          this.store.dispatch(setFriends({ friends: this.allfriends }));
        },
      })
    );
  }

  cancelRequest(friend: Friend) {
    this.loader.show();
    this.subscription.add(
      this.friendService.CancelRequest(friend.friendshipId, FriendshipStates.Cancelled)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: () => {
          this.mixpanel.log('Request Cancelled', { userId: friend.id })
          this.notifier.success('Friend Request cancelled.');
          this.allfriends = this.allfriends.filter(x => x.id !== friend.id);
          this.store.dispatch(setFriends({ friends: this.allfriends }));
        },
      })
    );
  }

  getImageUrl(updatedFriend: Friend){
    this.loader.show();
    this.subscription.add(
      this.userService.getImage(updatedFriend.id)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: (image: Image) => {
          if (image) {
            updatedFriend.imageUrl = this.imageService.imageToSafeUrl(image);
          }
          else{
            updatedFriend.imageUrl = '';
          }
        },
      })
    );
  }

  navigateToFriend(friend: Friend) {
    this.router.navigate(['home/friend', friend.id]);
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
