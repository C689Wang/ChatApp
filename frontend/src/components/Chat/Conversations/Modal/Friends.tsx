import { SearchedUser } from "@/util/types";
import { Flex, Stack, Text } from "@chakra-ui/layout";
import {IoIosCloseCircleOutline} from 'react-icons/io'

interface FriendsProps {
    friends: Array<SearchedUser>;
    removeFriend: (userId: string) => void
};

const Friends:React.FC<FriendsProps> = ({ friends, removeFriend}) => {
    
    return (
        <Flex mt={8} gap="10px" flexWrap="wrap">
            {friends.map(friend => (
                <Stack 
                    key={friend.id}
                    direction="row" 
                    align="center" 
                    bg="whiteAlpha.200" 
                    borderRadius={4} 
                    p={2}>
                    <Text>{friend.username}</Text>
                    <IoIosCloseCircleOutline 
                        size={20} 
                        cursor='pointer' 
                        onClick={() => removeFriend(friend.id)}/>
                </Stack>
            ))}
        </Flex>
    )
}
export default Friends;