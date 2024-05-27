import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentActivityContainerComponent } from './recent-activity-container/recent-activity-container.component';
import { ActivityItemComponent } from './recent-activity-container/activity-item/activity-item.component';



@NgModule({
  declarations: [RecentActivityContainerComponent, ActivityItemComponent],
  imports: [
    CommonModule
  ]
})
export class RecentActivityModule { }
