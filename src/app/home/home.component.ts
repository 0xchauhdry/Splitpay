import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { getUser } from '../../services/auth/user.state';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  user$ = this.store.pipe(select(getUser));

  constructor(private store: Store) {}
}
