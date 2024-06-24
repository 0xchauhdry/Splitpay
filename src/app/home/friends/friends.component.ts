import { Component } from '@angular/core';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { FriendsDashboardComponent } from './friends-dashboard/friends-dashboard.component';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  standalone: true,
  imports: [
    FriendsListComponent,
    FriendsDashboardComponent
  ],
})
export class FriendsComponent {
  
}
