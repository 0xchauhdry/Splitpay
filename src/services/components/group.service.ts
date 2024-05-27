import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { getUser } from '../auth/user.state';
import { Group } from 'src/assets/models/Group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor(private apiService: ApiService, private store: Store) {}
  groupBaseAPIUrl: string = 'group';

  public GetAll(): Observable<any> {
    return this.store.select(getUser).pipe(
      switchMap((user: any) => {
        return this.apiService.get(`${this.groupBaseAPIUrl}/getAll/${user.user.UserId}`);
      })
    );
  }

  public Add(group: Group): Observable<any>{
    return this.apiService.post(`${this.groupBaseAPIUrl}/add`, group);
  }
  public Get(groupId: number): Observable<any>{
    return this.apiService.get(`${this.groupBaseAPIUrl}/get/${groupId}`);
  }
}
