import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { FriendService } from '../components/friend.service';
import { Friend } from 'src/models/friend.model';
import { ImageService } from '../common/image.service';
import { AuthService } from '../auth/auth.service';
import { LoaderService } from '../services/loader.service';

@Injectable({
  providedIn: 'root',
})
export class FriendsBroadcastService {
  private _allFriends: BehaviorSubject<Friend[]> = new BehaviorSubject([]);

  constructor(private friendService: FriendService,
     private imageService: ImageService,
     private authService: AuthService,
     private loader: LoaderService
    ){
      this.authService
        .isLoggedIn()
        .subscribe((isLoggedIn) => {
          if (isLoggedIn){
            this.getFriends();
          }
          else{
            this.friends = [];
          }
        })
  }

  getFriends(){
    this.loader.show();
    this.friendService.GetFriends()
    .pipe(
      finalize(() => {
        this.loader.hide();
      })
    )
    .subscribe({
      next: (friends : Friend[]) => {
        friends.forEach(friend => {
          if (friend.image){
            friend.imageUrl = this.imageService.imageToSafeUrl(friend.image),
            friend.image = null
          }
        });
        this.friends = friends;
      }
    })
  }

  get friends(): any {
    return this._allFriends;
  }

  set friends(newValue: any) {
    this._allFriends.next(newValue);
  }
}
