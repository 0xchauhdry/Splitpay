import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Expense } from 'src/shared/models/expense/expense.model';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, TooltipModule],
})
export class ExpenseDetailComponent implements OnInit {
  expense: Expense;
  comments: any[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    private config: DynamicDialogConfig,
    public dialogService: DialogService
  ) {
    this.expense = this.config.data;
  }

  ngOnInit(): void {
    //implementation pending
  }
}
