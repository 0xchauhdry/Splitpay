import { Routes } from '@angular/router';
import { GroupComponent } from './group.component';
import { GroupDashboardComponent } from './group-dashboard/group-dashboard.component';

export const GROUP_ROUTES: Routes = [
  { path: '',
    component: GroupComponent,
    children: [
      { path: '', component: GroupDashboardComponent },
      { path: ':groupId',
        loadChildren: () => import('./group-detail/group-detail.routes')
          .then(m => m.GROUP_DETAIL_ROUTES) },
    ]
  },
];