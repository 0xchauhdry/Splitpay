import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseModel } from 'src/assets/models/Expense.model';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss']
})
export class ExpenseComponent {
  @Input() expense: ExpenseModel;

  constructor(private dialog: MatDialog){  }

  OpenExpenseDetail(){
    let dialogRef = this.dialog.open(ExpenseDetailComponent, {data: this.expense});

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Result is ${result}`);
    });
  }
}
