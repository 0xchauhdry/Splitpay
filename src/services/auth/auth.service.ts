import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { clearUser, setUser } from './user.state';
import { User } from 'src/app/shared/models/user.model';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_STORAGE_KEY = 'user';
  private csrfToken: string;
  constructor(private store: Store,
    private apiService: ApiService,
    private router: Router) {
    this.loadUserFromLocalStorage()
  }

  getCsrfToken(): Observable<{ csrfToken: string }> {
    return this.apiService.get<{ csrfToken: string }>('/api/csrf-token').pipe(
      tap(response => {
        this.csrfToken = response.csrfToken;
      })
    );
  }

  loginUser(user: User, token: string = ''): void {
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    //this.store.dispatch(setToken(token));
    this.loadUserFromLocalStorage();
    this.getCsrfToken();
  }

  logoutUser(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.store.dispatch(clearUser());
    //this.store.dispatch(clearToken());
  }

  isLoggedIn(): Observable<boolean> {
    return this.store.select((state: any) => state).pipe(
      map(state => state.user?.user !== null)
    );
  }

  getCsrfTokenValue(): string | null {
    return this.csrfToken;
  }

  private loadUserFromLocalStorage(): void {
    const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
    if (userJson && userJson !== 'undefined' && userJson.trim() !== '') {
      try {
        const user: User = JSON.parse(userJson);
        this.store.dispatch(setUser(user));
      } catch (error) {
        console.error('Error parsing user JSON from localStorage', error);
        localStorage.removeItem(this.USER_STORAGE_KEY);
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
