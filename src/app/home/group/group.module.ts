import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupComponent } from './group.component';
import { ExpenseModule } from '../expense/expense.module';



@NgModule({
  declarations: [GroupComponent],
  imports: [
    CommonModule,
    ExpenseModule
  ]
})
export class GroupModule { }
