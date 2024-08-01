import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ApiService } from 'src/services/api/api.service';
import { Image } from 'src/shared/models/image.model';
import { Friend } from 'src/shared/models/friend.model';
import { Group } from 'src/shared/models/group.model';
import { 
    FETCH_IMAGE, setImage, clearImage, 
    FETCH_FRIENDS, setFriends, clearFriends,
    FETCH_GROUPS, setGroups, clearGroups
} from './actions';
import { ImageService } from 'src/services/common/image.service';

@Injectable()
export class DataEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService,
        private imageService: ImageService
    ) {}

    image$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FETCH_IMAGE),
            mergeMap(() => this.apiService.get('user/0/image').pipe(
                map((image: Image) => setImage({ image })),
                catchError(error => of(clearImage()))
            ))
        )
    );

    friends$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FETCH_FRIENDS),
            mergeMap(() => this.apiService.get('friend/all').pipe(
                map((friends: Friend[])=> {
                    const friendList = friends.map(friend => {
                        if (friend.image){
                            friend.imageUrl = this.imageService.imageToSafeUrl(friend.image);
                            friend.image = null;
                        }
                        return friend;
                    }) 
                    return setFriends({ friends: friendList })
                }),
                catchError(error => of(clearFriends()))
            ))
        )
    );

    groups$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FETCH_GROUPS),
            mergeMap(() => this.apiService.get('group/all').pipe(
                map((groups: Group[]) => setGroups({ groups })),
                catchError(error => of(clearGroups()))
            ))
        )
    );
}
