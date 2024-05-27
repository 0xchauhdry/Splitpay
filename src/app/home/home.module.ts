import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExpenseModule } from './expense/expense.module';
import { GroupModule } from './group/group.module';
import { RouterModule } from '@angular/router';
import { HomeRoutingModule } from './home-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FriendsModule } from './friends/friends.module';



@NgModule({
  declarations: [HomeComponent, SidebarComponent],
  imports: [
    CommonModule,
    DashboardModule,
    ExpenseModule,
    GroupModule,
    RouterModule,
    HomeRoutingModule,
    FriendsModule
  ]
})
export class HomeModule { }
