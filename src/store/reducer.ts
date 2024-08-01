// src/app/store/reducers/data.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { Group } from 'src/shared/models/group.model';
import { Friend } from 'src/shared/models/friend.model';
import { Image } from 'src/shared/models/image.model';
import { User } from 'src/shared/models/user.model';
import { 
    setUser, clearUser,
    setImage, clearImage, 
    setFriends, clearFriends,
    setGroups, clearGroups,
    clearStore
} from './actions';

export interface State {
  user: User | null;
  image: Image | null;
  friends: Friend[] | null;
  groups: Group[] | null;
}

export const initialState: State = {
  user: null,
  image: null,
  friends: null,
  groups: null
};

const _dataReducer = createReducer(
  initialState,
  on(setUser, (state, { user }) => ({ ...state, user })),
  on(clearUser, (state) => ({ ...state, user: null })),
  on(setImage, (state, { image }) => ({ ...state, image })),
  on(clearImage, (state) => ({ ...state, image: null })),
  on(setFriends, (state, { friends }) => ({ ...state, friends })),
  on(clearFriends, (state) => ({ ...state, friends: null })),
  on(setGroups, (state, { groups }) => ({ ...state, groups })),
  on(clearGroups, (state) => ({ ...state, groups: null })),
  on(clearStore, () => initialState)
);

export function dataReducer(state: any, action: any) {
  return _dataReducer(state, action);
}
