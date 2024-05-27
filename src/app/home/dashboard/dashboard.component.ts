import { Component, OnInit } from '@angular/core';

interface User {
  name: string;
  balance: number;
}

interface Group {
  name: string;
}

interface Friend {
  name: string;
}

interface Transaction {
  description: string;
  amount: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: User = { name: '', balance: 0 };
  groups: Group[] = [];
  friends: Friend[] = [];
  transactions: Transaction[] = [];

  ngOnInit() {
    this.user = {
      name: 'John Doe',
      balance: 1000
    };
    this.groups = [
      { name: 'Group 1' },
      { name: 'Group 2' },
      { name: 'Group 3' }
    ];
    this.friends = [
      { name: 'Friend 1' },
      { name: 'Friend 2' },
      { name: 'Friend 3' }
    ];
    this.transactions = [
      { description: 'Rent', amount: -500 },
      { description: 'Salary', amount: 2000 },
      { description: 'Groceries', amount: -300 }
    ];
  }
}