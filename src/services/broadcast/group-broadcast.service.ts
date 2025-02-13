import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Group } from 'src/shared/models/group.model';
import { GetExpenseRequest } from 'src/shared/models/request/get-expense.request.model';

@Injectable()
export class GroupBroadcastService {
  private _selectedGroup: BehaviorSubject<Group | null> = new BehaviorSubject(null);

  get selectedGroup(): Observable<Group> {
    return this._selectedGroup.asObservable();
  }
  set selectedGroup(newValue: Group) {
    this._selectedGroup.next(newValue);
  }

  private _selectedFilters: Subject<GetExpenseRequest> = new Subject<GetExpenseRequest>();

  get selectedFilters(): Observable<GetExpenseRequest> {
    return this._selectedFilters.asObservable();
  }
  set selectedFilters(newValue: GetExpenseRequest) {
    this._selectedFilters.next(newValue);
  }

  private _showFilters: BehaviorSubject<boolean> = new BehaviorSubject(true);

  get showFilters(): Observable<boolean> {
    return this._showFilters.asObservable();
  }
  set showFilters(newValue: boolean) {
    this._showFilters.next(newValue);
  }
}
