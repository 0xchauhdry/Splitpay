import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Group } from 'src/shared/models/group.model';

@Injectable()
export class GroupBroadcastService {
  private _selectedGroup: BehaviorSubject<Group | null> = new BehaviorSubject(null);

  get selectedGroup(): Observable<Group> {
    return this._selectedGroup;
  }

  set selectedGroup(newValue: Group) {
    this._selectedGroup.next(newValue);
  }
}
