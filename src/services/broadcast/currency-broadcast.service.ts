import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Currency } from 'src/models/currency.model';
import { UserService } from '../components/user.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyBroadcastService {
  private _currencies: BehaviorSubject<Currency[]> = new BehaviorSubject([]);

  constructor(
     private userService: UserService,
     private authService: AuthService
    ){
    this.authService.isLoggedIn()
    .subscribe((isLoggedIn) => {
        if (isLoggedIn){
            this.getCurrencies();
        }
        else{
            this.currencies = [];
        }
    })
  }

  getCurrencies(){
    this.userService.getCurrencies()
    .subscribe({
      next: (currencies : Currency[]) => {
        this.currencies = currencies;
      }
    })
  }

  get currencies(): any {
    return this._currencies;
  }

  set currencies(newValue: any) {
    this._currencies.next(newValue);
  }
}
