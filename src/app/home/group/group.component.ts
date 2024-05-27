import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExpenseModel } from 'src/app/shared/models/expense.model';
import { GroupService } from 'src/services/components/group.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  expenses: ExpenseModel[] = [];
  groupInfo: any;
  usersInfo: any[];
  blah:any = {
    date: new Date(),
    title: 'Chinese Dinner',
    currency: 'PKR',
    balance: -750,
    detail: {
      amount: 750,
      createdBy: 'Ahmad Saleem',
      paidBy: ['Ali Akbar', 'Ahmad Saleem'],
      shares: [{name: 'Sohaib', owes: 150, gets: 0},
        {name: 'Mian HUsnain', owes: 150, gets: 0},
        {name: 'Syed Hamail', owes: 200, gets: 0},
        {name: 'Ahmad Saleem', owes: 150, gets: 200},
        {name: 'Ali Akbar', owes: 100, gets: 550}
      ]
    }
  }
  constructor(private route: ActivatedRoute, private groupService: GroupService){
    this.expenses.push(this.blah);
    this.expenses.push(this.blah);
    this.expenses.push(this.blah);
    this.expenses.push(this.blah);
    this.expenses.push(this.blah);
    this.expenses.push(this.blah);
  }

  ngOnInit() {
    this.route.queryParams.subscribe((queryParams) => {
      const groupId = queryParams['groupId'];

      this.GetGroupInfo(groupId);
    });
  }

  GetGroupInfo(groupId: number){
    this.groupService.Get(groupId).subscribe((res) => {
      this.groupInfo = res[0][0];
      this.usersInfo = res[1][0];
    })
  }

  GetExpenses(){

  }
}
