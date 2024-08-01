import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FriendsComponent } from './friends/friends.component';
import { Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { PersonalComponent } from './personal/personal.component';

export const HOME_ROUTES: Routes = [
  { path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'group',
        loadChildren: () => import('./group/group.routes').then(m => m.GROUP_ROUTES) 
      },
      { path: 'personal', component: PersonalComponent },
      { path: 'friend',
        loadChildren: () => import('./friends/friends.routes').then(m => m.FREIND_ROUTES) 
      },
      { path: 'settings', component: UserProfileComponent },
    ]
  },
];
