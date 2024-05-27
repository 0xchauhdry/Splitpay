import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExpenseModel } from 'src/assets/models/Expense.model';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss']
})
export class ExpenseDetailComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public expense: ExpenseModel){}

  ngOnInit(): void {
    console.log('Expense Detail Opened');
  }
}
