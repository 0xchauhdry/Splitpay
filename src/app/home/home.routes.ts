import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExpenseDetailComponent } from './expense/expense-detail/expense-detail.component';
import { GroupContainerComponent } from './group-container/group-container.component';
import { FriendsComponent } from './friends/friends.component';
import { Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const HOME_ROUTES: Routes = [
  { path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'group',
        loadChildren: () => import('./group-container/group.routes').then(m => m.GROUP_ROUTES) },
      { path: 'group', component: GroupContainerComponent },
      { path: 'expense', component: ExpenseDetailComponent },
      { path: 'friend', component: FriendsComponent },
      { path: 'settings', component: UserProfileComponent },
    ]
  },
];
