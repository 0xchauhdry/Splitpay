import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { User } from "src/models/user.model";
import { FriendshipStates } from "src/models/enums/friendship-status.enum";

@Injectable({
  providedIn: 'root'
})

export class FriendService {
  userId: number = 0;
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.authService.user$.subscribe({
      next: (user: User) => {
        if(user){
          this.userId = user.id;
        }
      }
    });
  }

  public GetFriends() {
    return this.apiService.get(`friend/getAll/${this.userId}`);
  }

  public AddFriend(email: string) {
    return this.apiService.post(`friend/${this.userId}/add`, { email: email });
  }

  public AcceptRequest(friendshipId: number, userId: number) {
    return this.apiService.put(`friend/${this.userId}/accept`, { friendshipId, userId });
  }

  public CancelRequest(friendshipId: number, state: number) {
    return this.apiService.put(`friend/cancel`, { friendshipId, state });
  }
}
