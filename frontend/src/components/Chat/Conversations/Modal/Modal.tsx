import { CreateConversationData, CreateConversationInput, SearchedUser, SearchUsersData, SearchUsersInput } from '@/util/types';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Button } from '@chakra-ui/button';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { Input, Stack } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ConversationOperations from "../../../../graphql/operations/conversation";
import UserOperations from "../../../../graphql/operations/user";
import Friends from './Friends';
import UserSearchList from './UserSearchList';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
};

const ConversationModal: React.FC<ModalProps> = ({ isOpen, onClose}) => {
    const { data: session } = useSession();
    const { user: {id: userId}} = session as Session;
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [friends, setFriends] = useState<Array<SearchedUser>>([]);
    const [searchUsers, { data, loading, error }] = useLazyQuery<
        SearchUsersData,
        SearchUsersInput>
        (UserOperations.Queries.searchUsers);

    const [createConversation, {loading: createConversationLoading}] = useMutation<
        CreateConversationData,
        CreateConversationInput>
        (ConversationOperations.Mutations.createConversation)
    
    
    const onCreateConversation = async () => {
        const friendIds = [userId, ...friends.map(friend => friend.id)];
        try {
            // createConversation mutation
            const { data, errors } = await createConversation({
                variables: {
                    friendIds
                }
            });
            
            if (!data?.createConversation) {
                throw new Error("Failed to create a conversation")
            }

            const { createConversation: { conversationId }} = data;
            router.push({ query: { conversationId }})

            // close modal
            setFriends([]);
            setUsername("");
            onClose();
        } catch (error: any) {
            console.log('onCreateConversation error', error)
            toast.error(error?.message);
        }
    };

    const onSearch = (event: React.FormEvent) => {
        event.preventDefault();
        // searchUsers query
        searchUsers({ variables: { username } });
    }

    const addFriend = (user: SearchedUser) => {
        setFriends(prev => [...prev, user]);
        setUsername("");
    }

    const removeFriend = (userId: string) => {
        setFriends(prev => prev.filter(friend => friend.id != userId))
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent bg="#2d2d2d" pb={4}>
                    <ModalHeader>Create a Conversation</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={onSearch}>
                            <Stack spacing={4}>
                                <Input
                                    placeholder='Enter a username'
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}>
                                </Input>
                                <Button type="submit" isDisabled={!username} isLoading={loading}>
                                    Search
                                </Button>

                            </Stack>
                        </form>
                        {data?.searchUsers && <UserSearchList users={data.searchUsers} addFriend={addFriend} />}
                        {friends.length !== 0 && (
                            <>
                                <Friends friends={friends} removeFriend={removeFriend} />
                                <Button 
                                    bg="brand.100" 
                                    width="100%" 
                                    mt={6} 
                                    _hover={{ bg: "brand.100"}}
                                    isLoading={createConversationLoading}
                                    onClick={onCreateConversation}
                                    >
                                        Create Conversation
                                </Button>
                            </>
                        )}
                    </ModalBody>

                    {/* <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='ghost'>Secondary Action</Button>
                    </ModalFooter> */}
                </ModalContent>
            </Modal>
        </>
    )
}
export default ConversationModal;