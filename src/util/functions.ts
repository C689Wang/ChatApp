import { FriendPopulated } from "../../../backend/src/util/types";

export const formatUsernames = (
  friends: Array<FriendPopulated>,
  myUserId: string
): string => {
  const usernames = friends
    .filter((friend) => friend.user.id != myUserId)
    .map((friend) => friend.user.username);

  return usernames.join(", ");
};