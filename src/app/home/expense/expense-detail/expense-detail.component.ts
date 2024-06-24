import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ExpenseModel, ShareModel } from 'src/models/expense.model';
import { AddExpenseComponent } from '../add-expense/add-expense.component';

interface ExtendedShareModel extends ShareModel {
  paid?: number;
}

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, TooltipModule],
})
export class ExpenseDetailComponent implements OnInit {
  expense: ExpenseModel;
  comments: any[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    private config: DynamicDialogConfig,
    public dialogService: DialogService
  ) {
    this.expense = this.config.data;
    this.expense.detail.shares.forEach((share) => {
      let newShare = share as ExtendedShareModel;
      newShare.paid = share.owes + share.gets;
    });
  }

  ngOnInit(): void {
  }
}
