import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function canActivate(): Observable<boolean | UrlTree> {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn().pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
}
