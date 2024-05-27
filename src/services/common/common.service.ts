import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserState, getUser } from '../auth/user.state';
import { User } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private store: Store) {}

  GetLoggedInUser(): Observable<any> {
    return this.store.select<User>(getUser);
  }
}
