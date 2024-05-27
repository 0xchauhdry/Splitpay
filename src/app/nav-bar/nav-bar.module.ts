import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar.component';
import { RouterModule } from '@angular/router';
import { NotificationCenterModule } from '@novu/notification-center-angular';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    NavBarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NotificationCenterModule,
    FormsModule
  ],
  exports: [NavBarComponent]
})
export class NavBarModule { }
