import { Component } from '@angular/core';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { RouterOutlet } from '@angular/router';
import { GroupDashboardComponent } from './group-dashboard/group-dashboard.component';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';

@Component({
  selector: 'app-group-container',
  standalone: true,
  imports: [
    RouterOutlet,
    GroupListComponent,
    GroupDetailComponent,
    GroupDashboardComponent
  ],
  providers:[
    GroupBroadcastService
  ],
  templateUrl: './group-container.component.html',
  styleUrl: './group-container.component.scss'
})
export class GroupContainerComponent {

}
