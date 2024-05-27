import { createAction, createReducer, on } from '@ngrx/store';
import { User } from 'src/app/shared/models/user.model';

export interface UserState {
  user: User | null;
}

export const setUser = createAction('[User] Set User', (user: User) => ({ user }));
export const clearUser = createAction('[User] Clear User');

export const userReducer = createReducer(
  { user: null } as UserState,
  on(setUser, (state, { user }) => ({ ...state, user })),
  on(clearUser, (state) => ({ ...state, user: null }))
);

export const getUser = (state: UserState) => state.user;
