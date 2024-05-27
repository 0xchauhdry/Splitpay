import { Injectable } from '@angular/core';
import { ApiService } from 'src/services/api/api.service';
import { LogIn } from '../../app/shared/models/logIn.model';
import { User } from '../../app/shared/models/user.model';
import { Store } from '@ngrx/store';
import { getUser } from '../auth/user.state';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService{
  constructor(private apiService: ApiService, private store: Store){}

  public logIn(logIn : LogIn){
    return this.apiService.post('user/login', logIn)
  }

  public signUp(user : User){
    return this.apiService.post('user/signup', user)
  }

  public GetCurrencies() {
    return this.store.select(getUser).pipe(
      switchMap((user: any) => {
        return this.apiService.get(`currency/${user.user.UserId}`);
      })
    );
  }
}

