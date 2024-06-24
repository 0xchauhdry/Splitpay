import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Group } from 'src/models/group.model';
import { AuthService } from '../auth/auth.service';
import { User } from 'src/models/user.model';
import { GroupRequest } from 'src/models/request/group.request.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  userId: number = 0;
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.authService.user$.subscribe({
      next: (user: User) => {
        if(user){
          this.userId = user.id;
        }
      }
    });
  }

  public getAll(): Observable<any> {
    return this.apiService.get(`group/getAll/${this.userId}`);
  }

  public add(group: Group): Observable<any>{
    return this.apiService.post(`group/add`, group);
  }

  public update(group: GroupRequest): Observable<any>{
    return this.apiService.put(`group/update`, group);
  }
  public get(groupId: number): Observable<any>{
    return this.apiService.get(`group/get/${groupId}`);
  }
}
