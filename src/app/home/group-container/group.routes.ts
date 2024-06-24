import { Routes } from '@angular/router';
import { GroupContainerComponent } from './group-container.component';
import { GroupDashboardComponent } from './group-dashboard/group-dashboard.component';

export const GROUP_ROUTES: Routes = [
  { path: '',
    component: GroupContainerComponent,
    children: [
      { path: '', component: GroupDashboardComponent },
      { path: ':groupId',
        loadChildren: () => import('./group-detail/group-detail.routes')
          .then(m => m.GROUP_DETAIL_ROUTES) },
    ]
  },
];