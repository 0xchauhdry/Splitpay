import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { getUser } from '../../services/auth/user.state';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExpenseComponent } from './expense/expense.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FriendsComponent } from './friends/friends.component';
import { LeftNavComponent } from './left-nav/left-nav.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    ExpenseComponent,
    RouterModule,
    FriendsComponent,
    LeftNavComponent,
    RouterOutlet
  ]
})
export class HomeComponent {
  constructor() {}
}
