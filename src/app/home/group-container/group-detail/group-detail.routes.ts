import { Routes } from '@angular/router';
import { GroupDetailComponent } from './group-detail.component';
import { GroupExpeneseComponent } from './group-expenese/group-expenese.component';
import { GroupSettingsComponent } from './group-settings/group-settings.component';

export const GROUP_DETAIL_ROUTES: Routes = [
    { path: '',
      component: GroupDetailComponent,
      children: [
        { path: '', component: GroupExpeneseComponent },
        { path: 'settings', component: GroupSettingsComponent }
      ]
    },
  ];