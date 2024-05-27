import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupComponent } from './group/group.component';
import { ExpenseDetailComponent } from './expense/expense-detail/expense-detail.component';
import { FriendsComponent } from './friends/friends.component';

const routes: Routes = [
  { path: '',
    component: HomeComponent,
    children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'group', component: GroupComponent },
    { path: 'expense', component: ExpenseDetailComponent },
    { path: 'friend', component: FriendsComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
