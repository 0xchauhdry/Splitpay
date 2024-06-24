import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Group } from 'src/models/group.model';

@Injectable()
export class GroupBroadcastService {
  private _selectedGroupId: BehaviorSubject<number | null> = new BehaviorSubject(null);

  get selectedGroupId(): Observable<number> {
    return this._selectedGroupId;
  }

  set selectedGroupId(newValue: number) {
    this._selectedGroupId.next(newValue);
  }

  private _selectedGroup: BehaviorSubject<Group | null> = new BehaviorSubject(null);

  get selectedGroup(): Observable<Group> {
    return this._selectedGroup;
  }

  set selectedGroup(newValue: Group) {
    this._selectedGroup.next(newValue);
  }

  private _updateExpenseList: Subject<boolean> = new Subject();

  get updateExpenseList(): Observable<boolean> {
    return this._updateExpenseList;
  }

  set updateExpenseList(newValue: boolean){
    this._updateExpenseList.next(newValue);
  }
}
