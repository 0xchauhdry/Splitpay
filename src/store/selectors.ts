import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './reducer';

const selectStoreData = createFeatureSelector<State>('data');

export const getUser = createSelector(
    selectStoreData, (state: State) => state.user
);

export const getImage = createSelector(
    selectStoreData, (state: State) => state.image
);

export const getFriends = createSelector(
    selectStoreData, (state: State) => state.friends
);

export const getGroups = createSelector(
    selectStoreData, (state: State) => state.groups
);