import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { NotifierService } from '../services/notifier.service';

export const apiResponseInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const notifier = inject(NotifierService);

  return next(request).pipe(
    map((event: HttpEvent<any>) => event),
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 400:
            notifier.error(error.error.error);
            break;
          case 401:
            notifier.error('You are not authorized to access this resource. Please log in and try again.');
            break;
          case 403:
            notifier.error('Access to this resource is forbidden. Please contact the administrator if you believe this is an error.');
            break;
          case 429:
            notifier.error('You are being rate limited. Please try again later.');
            break;
          default:
            notifier.error('An unexpected error occurred. Please try again later.');
            break;
      }
    }
    return throwError(() => new Error(error.error.error));
    })
  );
};