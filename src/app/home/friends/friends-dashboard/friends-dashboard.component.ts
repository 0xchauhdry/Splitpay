import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-friends-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    TableModule
  ],
  templateUrl: './friends-dashboard.component.html',
  styleUrl: './friends-dashboard.component.scss'
})
export class FriendsDashboardComponent {
  friendBalanceData: any;
  expenseTrendData: any;
  transactions: any[];
  friends: any[];

  constructor() {
    this.friends = [
      { name: 'Alice', balance: 150 },
      { name: 'Bob', balance: -50 },
      { name: 'Charlie', balance: 200 },
      // Add more friends as needed
    ];

    this.friendBalanceData = {
      labels: this.friends.map(friend => friend.name),
      datasets: [
        {
          label: 'Balance',
          backgroundColor: this.friends.map(friend => friend.balance >= 0 ? '#4CAF50' : '#F44336'),
          borderColor: '#1E88E5',
          data: this.friends.map(friend => friend.balance)
        }
      ]
    };

    this.expenseTrendData = {
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [
        {
          label: 'Expenses',
          data: [65, 59, 80, 81, 56],
          fill: false,
          borderColor: '#42A5F5'
        }
      ]
    };

    this.transactions = [
      { date: '2024-06-01', description: 'Lunch', amount: 15, friend: 'Alice' },
      { date: '2024-06-02', description: 'Groceries', amount: 50, friend: 'Bob' },
      // Add more transactions here
    ];
  }
}
