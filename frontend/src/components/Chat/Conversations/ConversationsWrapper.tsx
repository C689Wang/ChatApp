import { Box} from '@chakra-ui/react';
import { Session } from 'next-auth';
import { getSession, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import ConversationList from './ConversationList';
import ConversationOperations from "../../../graphql/operations/conversation"
import { gql, useMutation, useQuery } from "@apollo/client"
import { GetConversationsData } from '@/util/types';
import { ConversationPopulated, FriendPopulated } from '../../../../../backend/src/util/types';
import { useRouter } from 'next/router';
import SkeletonLoader from '@/components/generic/SkeletonLoader';

interface ConversationsWrapperProps {
    session: Session
};

const ConversationsWrapper:React.FC<ConversationsWrapperProps> = () => {
    const { data: session } = useSession();
    const { user: {id : userId}} = session as Session;
    const { 
        data: conversationsData,
        error: conversationsError, 
        loading: conversationsLoading,
        subscribeToMore
    } = useQuery<GetConversationsData>(ConversationOperations.Queries.getConversations);

    const router = useRouter();
    const { query : { conversationId }} = router;

    const [markConversationAsRead] = useMutation<
        { markConversationAsRead: boolean}, 
        { userId: string, conversationId: string}>
        (ConversationOperations.Mutations.markConversationAsRead)

    const onClickConversation = async (
        conversationId: string,
        hasSeenLatestMessage: boolean
        ) => {
        // push the conversationId to the router
        router.push({ query: { conversationId }});

        // Mark the conversation as read
        if (hasSeenLatestMessage) return;
        
        try {
            await markConversationAsRead({
                variables: {
                    userId,
                    conversationId
                },
                optimisticResponse: {
                    markConversationAsRead: true,
                }, 
                update: (cache) => {
                    // get conversationFriends from cache
                    const friendsFragment = cache.readFragment<{ friends: Array<FriendPopulated> }>({
                        id: `Conversation:${conversationId}`,
                        fragment: gql`
                            fragment Friends on Conversation {
                                friends {
                                    user {
                                        id
                                        username
                                    }
                                    hasSeenLatestMessage
                                }
                            }
                        `
                    })
                    if (!friendsFragment) return;
                    const friends = [...friendsFragment.friends];
                    const userFriendIndex = friends.findIndex(f => f.user.id === userId);

                    if (userFriendIndex === -1) return;

                    const userFriend = friends[userFriendIndex];

                    // Show latest message as read
                    friends[userFriendIndex] = {
                        ...userFriend,
                        hasSeenLatestMessage: true
                    }

                    // update cache
                    cache.writeFragment({
                        id: `Conversation:${conversationId}`,
                        fragment: gql`
                            fragment UpdatedFriend on Conversation {
                                friends
                            }
                        `,
                        data: {
                            friends
                        }
                    })
                }
            })
        } catch (error: any) {
            console.log("onViewConversation error", error)
        }
    }

    const subscribeToNewConversations = () => {
        subscribeToMore({
            document: ConversationOperations.Subscriptions.conversationCreated,
            updateQuery: (prev, { 
                subscriptionData 
                }: { 
                    subscriptionData: { 
                        data: { conversationCreated: ConversationPopulated}
                    }
                }
            ) => {
                if (!subscriptionData.data) return prev;

                const newConversation = subscriptionData.data.conversationCreated;
                return Object.assign({}, prev, {
                    getConversations: [newConversation, ...prev.getConversations]
                })
            }
        })
    }

    // Execute subscription on mount
    useEffect(() => {
        subscribeToNewConversations();
    }, [])

    return (
        
        <Box 
            display={{ base: conversationId ? 'none' : 'flex', md: 'flex'}}
            width={{ base: '100%', md: "400px"}} 
            flexDirection="column"
            gap={4}
            bg="whiteAlpha.50" 
            py={6} 
            px={3}
        >
            {conversationsLoading ? (
                <SkeletonLoader count={7} height="80px" width="270px" />
            ) : (
                <ConversationList 
                conversations={conversationsData?.getConversations || []} 
                onClickConversation={onClickConversation}/>
            )}
        </Box>
    );
}
export default ConversationsWrapper;