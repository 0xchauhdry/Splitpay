import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from 'src/shared/models/user.model';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { NotifierService } from '../services/notifier.service';
import { setUser, clearStore } from 'src/store/actions';
import { getUser } from 'src/store/selectors';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Injectable()
export class AuthService {  
  private readonly USER_STORAGE_KEY = 'user';
  private _csrfToken: string = '';
  user$: Observable<User>;
  accessToken: any;

  get csrfToken(): any {
    return this._csrfToken;
  }

  set csrfToken(newValue: any) {
    this._csrfToken = newValue;
  }

  constructor(
    private store: Store,
    private router: Router,
    private notifier: NotifierService,
    private socialAuth: SocialAuthService,
  ){
    this.loadUserFromLocalStorage();
    this.user$ = this.store.select(getUser);
  }

  signOut(): void {
    this.socialAuth.signOut();
  }

  refreshToken(): void {
    this.socialAuth.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

  getAccessToken(): void {
    this.socialAuth
    .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
    .then(accessToken => this.accessToken = accessToken);
  }

  refreshAccessToken(): void {
    this.socialAuth.refreshAccessToken(GoogleLoginProvider.PROVIDER_ID);
  }

  loginUser(user: User): void {
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    this.loadUserFromLocalStorage();
  }

  logoutUser(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.store.dispatch(clearStore());
  }

  isLoggedIn(): Observable<boolean> {
    return this.store.select(getUser).pipe(map(user => user !== null));
  }

  private loadUserFromLocalStorage(): void {
    const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
    if (userJson && userJson !== 'undefined' && userJson.trim() !== '') {
      try {
        const user: User = JSON.parse(userJson);
        this.store.dispatch(setUser({ user }));
      } catch (error) {
        this.notifier.error('Error parsing user JSON from localStorage', error);
        localStorage.removeItem(this.USER_STORAGE_KEY);
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
