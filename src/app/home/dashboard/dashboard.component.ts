import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    ChartModule,
    TableModule
  ]
})
export class DashboardComponent implements OnInit {  
  pieData: any;
  barData: any;
  transactions: any[];

  constructor() {
    this.pieData = {
      labels: ['Group 1', 'Group 2', 'Group 3'],
      datasets: [
        {
          data: [300, 500, 200],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }
      ]
    };

    this.barData = {
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [
        {
          label: 'Expenses',
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: [65, 59, 80, 81, 56]
        }
      ]
    };

    this.transactions = [
      { date: '2024-06-01', description: 'Lunch', amount: 15, group: 'Friends' },
      { date: '2024-06-02', description: 'Groceries', amount: 50, group: 'Family' },
      // Add more transactions here
    ];
  }
  

  ngOnInit() {}
}