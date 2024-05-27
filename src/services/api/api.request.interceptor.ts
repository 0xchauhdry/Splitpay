import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiRequestInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const csrfToken = this.authService.getCsrfTokenValue();
    if (csrfToken){
      const modifiedReq = request.clone({
        setHeaders: {
          'CSRF-Token': csrfToken
        },
        withCredentials: true
      });
      return next.handle(modifiedReq);
    }
    else{
      const modifiedReq = request.clone({
        withCredentials: true
      });
      return next.handle(modifiedReq);
    }
    // return this.store.select(getToken).pipe(
    //   switchMap((token: any) => {
    //     const modifiedReq = request.clone({
    //       setHeaders: {
    //         Authorization: `${token.token}`,
    //       },
    //     });
    //     return next.handle(request);
    //   })
    // );
  }
}
