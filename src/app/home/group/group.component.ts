import { Component } from '@angular/core';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { RouterOutlet } from '@angular/router';
import { GroupDashboardComponent } from './group-dashboard/group-dashboard.component';
import { GroupBroadcastService } from 'src/services/broadcast/group-broadcast.service';
import { GroupService } from 'src/services/components/group.service';
import { ExpenseBroadcastService } from 'src/services/broadcast/expense-broadcast.service';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    RouterOutlet,
    GroupListComponent,
    GroupDetailComponent,
    GroupDashboardComponent
  ],
  providers:[
    GroupService,
    GroupBroadcastService,
    ExpenseBroadcastService
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.scss'
})
export class GroupComponent {

}
