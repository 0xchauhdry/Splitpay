import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ExpenseComponent } from './expense.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [ExpenseComponent, ExpenseDetailComponent],
  imports: [
    CommonModule,
    MatDialogModule,
  ],
  providers: [DatePipe],
  exports:[
    ExpenseComponent, ExpenseDetailComponent
  ]
})
export class ExpenseModule { }
