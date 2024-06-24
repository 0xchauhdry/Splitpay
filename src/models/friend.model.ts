import { FriendshipStates } from "./enums/friendship-status.enum";
import { User } from "./user.model"

export class Friend extends User {
    friendshipId: number;
    isRequester: boolean;
    status: FriendshipStates;
}