// src/app/store/actions/data.actions.ts
import { createAction, props } from '@ngrx/store';
import { Friend } from 'src/shared/models/friend.model';
import { Group } from 'src/shared/models/group.model';
import { Image } from 'src/shared/models/image.model';
import { User } from 'src/shared/models/user.model';

export const setUser = createAction('[Data] Set User', props<{ user: User }>());
export const clearUser = createAction('[Data] Clear User');

export const FETCH_IMAGE = createAction('[Data] Load Image');
export const setImage = createAction('[Data] Set Image', props<{ image: Image }>());
export const clearImage = createAction('[Data] Clear Image');

export const FETCH_FRIENDS = createAction('[Data] Load Friends');
export const setFriends = createAction('[Data] Set Friends', props<{ friends: Friend[] }>());
export const clearFriends = createAction('[Data] Clear Friends');

export const FETCH_GROUPS = createAction('[Data] Load Groups');
export const setGroups = createAction('[Data] Set Groups', props<{ groups: Group[] }>());
export const clearGroups = createAction('[Data] Clear Groups');

export const clearStore = createAction('[Date] Clear Store');