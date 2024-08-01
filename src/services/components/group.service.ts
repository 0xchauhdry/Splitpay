import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Group } from 'src/shared/models/group.model';
import { GroupRequest } from 'src/shared/models/request/group.request.model';

@Injectable()
export class GroupService {
  constructor(private apiService: ApiService) {}

  public getAll(): Observable<any> {
    return this.apiService.get(`group/all`);
  }

  public add(group: Group): Observable<any>{
    return this.apiService.post(`group/add`, group);
  }

  public update(group: GroupRequest): Observable<any>{
    return this.apiService.put(`group/update`, group);
  }
  
  public get(groupId: number): Observable<any>{
    return this.apiService.get(`group/${groupId}`);
  }
  
  public getBalances(groupId: number): Observable<any>{
    return this.apiService.get(`group/${groupId}/balances`);
  }
  
  public delete(groupId: number): Observable<any>{
    return this.apiService.delete(`group/${groupId}`);
  }
}
