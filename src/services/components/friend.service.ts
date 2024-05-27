import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { UserState, getUser } from "../auth/user.state";
import { Store } from "@ngrx/store";
import { switchMap } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class FriendService {
  constructor(private apiService: ApiService, private store: Store<UserState>) { }
  friendBaseUrl: string = 'friend';

  public GetFriends() {
    return this.store.select(getUser).pipe(
      switchMap((user: any) => {
        return this.apiService.get(`${this.friendBaseUrl}/getAll/${user.user.UserId}`);
      })
    );
  }

  public AddFriend(email: string) {
    return this.store.select(getUser).pipe(
      switchMap((user: any) => {
        return this.apiService.post(`${this.friendBaseUrl}/add`, { UserId: user.user.UserId, email: email });
      })
    );
  }

  public UpdateRequest(id: number, state: number) {
    return this.apiService.put(`${this.friendBaseUrl}/update`, { friendshipId: id, state: state });
  }

  public CancelRequest(id: number, state: number) {
    return this.apiService.put(`${this.friendBaseUrl}/cancel`, { friendshipId: id, state: state });
  }

}
