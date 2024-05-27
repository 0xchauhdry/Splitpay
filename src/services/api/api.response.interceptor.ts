import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { NotifierService } from '../services/notifier.service';

@Injectable({
  providedIn: 'root',
})
export class ApiResponseInterceptor implements HttpInterceptor {
  constructor(private notifier: NotifierService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => event),

      catchError((error: any) => {
        if (error instanceof HttpErrorResponse){
          if (error.status == 400) {
            this.notifier.error(error.error.error);
          }
          else if (error.status === 401) {
            this.notifier.error('Unauthorized access');
          }
          else if (error.status === 403) {
            this.notifier.error('Error: 403 Forbidden');
          } else {
            this.notifier.error('An unexpected error occurred');
          }
        } 
        else{
          this.notifier.error(error.message);
        }
        return throwError(() => new Error(error.error.error));
      })
    );
  }
}
