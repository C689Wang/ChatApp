import { Box, Button, Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { ConversationPopulated } from '../../../../../backend/src/util/types';
import ConversationItem from './ConversationItem';
import ConversationModal from "./Modal/Modal";
import { useMutation } from '@apollo/client';
import ConversationOperations from "../../../graphql/operations/conversation"
import { toast } from 'react-hot-toast';

interface ConversationListProps {
    conversations: Array<ConversationPopulated>;
    onClickConversation: (conversationId: string, hasSeenLatestMessage: boolean) => void
};

const ConversationList:React.FC<ConversationListProps> = ({ conversations, onClickConversation }) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    const [deleteConversation] = useMutation<{
        deleteConversation: boolean;
        conversationId: string
    }>(ConversationOperations.Mutations.deleteConversation);

    const { data: session } = useSession();
    const { user: { id: userId }} = session as Session;

    const onDeleteConversation = async (conversationId: string) => {
        try {
            toast.promise(
                deleteConversation({
                    variables: {
                        conversationId
                    },
                    update: () => {
                        router.replace(typeof process.env.NEXT_PUBLIC_BASE_URL === "string" ?
                        process.env.NEXT_PUBLIC_BASE_URL : ""
                        )
                    }
                }), {
                    loading: "Deleting Conversation",
                    success: "Conversation Deleted",
                    error: "Failed to Delete Conversation"
                }
            )
        } catch (error) {
            console.log('onDeleteConversation error', error)
        }
    }

    const sortedConversations = [...conversations].sort(
        (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf())
    
    return (
        <Box width="100%" position="relative" height="100%" overflow="hidden">
            <Box 
                py={2}
                px={4} 
                mb={4} 
                bg="blackAlpha.300" 
                borderRadius={4} 
                cursor="pointer"
                onClick={onOpen}
            >
                <Text 
                    textAlign='center' 
                    color='whiteAlpha.800'
                    fontWeight={500}
                >
                    Find or start a conversation
                </Text>
            </Box>
            <ConversationModal isOpen={isOpen} onClose={onClose} />
            {sortedConversations.map(conversation => {
                const friend = conversation.friends.find(friend => friend.user.id === userId)
                if (friend === undefined) {
                    throw new TypeError("Participant is undefined");
                }
                return (
                    <ConversationItem 
                    key={conversation.id} 
                    conversation={conversation} 
                    userId={userId}
                    onClick={() => onClickConversation(conversation.id, friend?.hasSeenLatestMessage)}
                    isSelected={conversation.id === router.query.conversationId} 
                    hasSeenLatestMessage={friend?.hasSeenLatestMessage}
                    onDeleteConversation={onDeleteConversation}
                    />
                )
            })}
            <Box 
                position="absolute" 
                bottom={0} 
                left={0}
                width="100%"
                px={8}
            >
                <Button 
                    width="100%"
                    onClick={() => signOut}
                >Logout</Button>
            </Box>
        </Box>
    )
}
export default ConversationList;