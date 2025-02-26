import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { ExpenseComponent } from './expense/expense.component';
import { Expense } from 'src/shared/models/expense/expense.model';
import { Subscription } from 'rxjs';
import { Group } from 'src/shared/models/group.model';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/shared/models/user.model';
import { LazyScrollerDirective } from 'src/shared/directives/lazy-scroller.directive';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    DataViewModule,
    ExpenseComponent,
    LazyScrollerDirective
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
  @Input() expenses: Expense[];
  @Output() scrolled: EventEmitter<void> = new EventEmitter<void>();
  user: User;
  subscription: Subscription;
  group: Group;

  constructor(
    private authService: AuthService
  ){
    this.subscription = new Subscription();
  }

  getCurrentUser(){
    this.subscription.add(
      this.authService.user$
      .subscribe((user: User) => {
        if (user) this.user = user;
      })
    );
  }

  scroll(){
    this.scrolled.emit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
