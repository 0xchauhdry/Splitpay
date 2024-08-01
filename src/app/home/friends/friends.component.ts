import { Component } from '@angular/core';
import { FriendsListComponent } from './friends-list/friends-list.component';
import { FriendsDashboardComponent } from './friends-dashboard/friends-dashboard.component';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';
import { FriendService } from 'src/services/components/friend.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    FriendsListComponent,
    FriendsDashboardComponent
  ],
  providers:[
    FriendService,
    ExpenseBroadcastService
  ]
})
export class FriendsComponent {
  
}
