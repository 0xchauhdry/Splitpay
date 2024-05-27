import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FriendService } from '../components/friend.service';

@Injectable({
  providedIn: 'root',
})
export class FriendsBroadcastService implements OnInit {
  private _allFriends: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(private friendService: FriendService) {}

  ngOnInit(): void {
    this.GetFriends();
  }

  GetFriends(){
    this.friendService.GetFriends().subscribe({
      next: (res: any[]) => {
        this.friends = res.slice();
        return res;
      },
    });
  }

  get friends(): any {
    return this._allFriends;
  }

  set friends(newValue: any) {
    this._allFriends.next(newValue);
  }
}
