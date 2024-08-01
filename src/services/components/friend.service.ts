import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  constructor(private apiService: ApiService) {}

  public GetFriends() {
    return this.apiService.get('friend/all');
  }

  public AddFriend(email: string) {
    return this.apiService.post('friend/add', { email: email });
  }

  public AcceptRequest(friendshipId: number, userId: number) {
    return this.apiService.put('friend/accept', { friendshipId, userId });
  }

  public CancelRequest(friendshipId: number, state: number) {
    return this.apiService.put('friend/cancel', { friendshipId, state });
  }
}
