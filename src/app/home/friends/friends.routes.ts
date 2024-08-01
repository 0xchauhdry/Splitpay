import { Routes } from '@angular/router';
import { FriendsComponent } from './friends.component';
import { FriendsDashboardComponent } from './friends-dashboard/friends-dashboard.component';
import { FriendsDetailComponent } from './friends-detail/friends-detail.component';

export const FREIND_ROUTES: Routes = [
  { path: '',
    component: FriendsComponent,
    children: [
      { path: '', component: FriendsDashboardComponent },
      { path: ':friendId', component: FriendsDetailComponent },
    ]
  },
];