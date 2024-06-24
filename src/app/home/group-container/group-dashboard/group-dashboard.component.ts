import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-group-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    TableModule
  ],
  templateUrl: './group-dashboard.component.html',
  styleUrl: './group-dashboard.component.scss'
})
export class GroupDashboardComponent {
  groupBalanceData: any;
  expenseTrendData: any;
  transactions: any[];
  groups: any[];

  constructor() {
    this.groups = [
      { name: 'Group 1', balance: 300 },
      { name: 'Group 2', balance: -150 },
      { name: 'Group 3', balance: 500 },
      // Add more groups as needed
    ];

    this.groupBalanceData = {
      labels: this.groups.map(group => group.name),
      datasets: [
        {
          label: 'Balance',
          backgroundColor: this.groups.map(group => group.balance >= 0 ? '#4CAF50' : '#F44336'),
          borderColor: '#1E88E5',
          data: this.groups.map(group => group.balance)
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
      { date: '2024-06-01', description: 'Lunch', amount: 15, group: 'Group 1' },
      { date: '2024-06-02', description: 'Groceries', amount: 50, group: 'Group 2' },
      // Add more transactions here
    ];
  }

}
