import { FriendPopulated } from "./types";

export function userIsConversationFriend(
    friends: Array<FriendPopulated>, 
    userId: string
): boolean {
    return !!friends.find(friend => friend.userId === userId);
};