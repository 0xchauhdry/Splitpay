import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${environment.baseAPIURL}/${endpoint}`);
  }

  post(endpoint: string, data: any) {
    return this.http.post(`${environment.baseAPIURL}/${endpoint}`, data);
  }

  put(endpoint: string, data: any) {
    return this.http.put(`${environment.baseAPIURL}/${endpoint}`, data);
  }
}
