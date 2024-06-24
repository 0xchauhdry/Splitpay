import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/services/api/api.service';

@Injectable({
  providedIn: 'root'
})

export class CsrfService{
  constructor(private apiService: ApiService){}

  public get(): Observable<{csrfToken: string}>{
    return this.apiService.get('csrf-token');
  }
}

