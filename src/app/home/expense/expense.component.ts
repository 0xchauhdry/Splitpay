import { Component, Input } from '@angular/core';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { CommonModule, DatePipe } from '@angular/common';
import { ExpenseModel, ExpensesModel } from 'src/models/expense.model';
import { DialogService } from 'primeng/dynamicdialog';
@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
})
export class ExpenseComponent {
  @Input() expense: ExpenseModel;
  @Input() item: ExpensesModel;
  @Input() first: boolean;

  constructor(private dialog: DialogService) {}

  OpenExpenseDetail() {
    let dialogRef = this.dialog.open(ExpenseDetailComponent, {
      data: this.expense,
      header: this.expense.title,
      width: '60vw',
      breakpoints: { '1299px': '75vw', '950px': '90vw' },
    });

    dialogRef.onClose.subscribe((result) => {
      console.log(`Result is ${result}`);
    });
  }
}
