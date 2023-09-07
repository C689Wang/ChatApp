import SkeletonLoader from '@/components/generic/SkeletonLoader';
import { ConversationDeletedData, ConversationUpdatedData, GetConversationsData } from '@/util/types';
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Box } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { ConversationPopulated, FriendPopulated } from '../../../../../backend/src/util/types';
import ConversationOperations from "../../../graphql/operations/conversation";
import ConversationList from './ConversationList';

interface ConversationsWrapperProps {
    session: Session
};

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = () => {
    const { data: session } = useSession();
    const { user: { id: userId } } = session as Session;
    const {
        data: conversationsData,
        error: conversationsError,
        loading: conversationsLoading,
        subscribeToMore
    } = useQuery<GetConversationsData>(ConversationOperations.Queries.getConversations);

    const router = useRouter();
    const { query: { conversationId } } = router;

    const [markConversationAsRead] = useMutation<
        { markConversationAsRead: boolean },
        { userId: string, conversationId: string }>
        (ConversationOperations.Mutations.markConversationAsRead);

    useSubscription<ConversationUpdatedData>(ConversationOperations.Subscriptions.conversationUpdated,
        {
            onData: ({ client, data }) => {

                const { data: subscriptionData } = data;

                if (!subscriptionData) return;

                const { conversationUpdated: { conversation: updatedConversation } } = subscriptionData

                const currentlyViewingConversation = updatedConversation.id === conversationId;

                if (currentlyViewingConversation) {
                    onClickConversation(conversationId, false);
                }

            }
        })

    useSubscription<ConversationDeletedData>(ConversationOperations.Subscriptions.conversationDeleted,
        {
            onData: ({ client, data }) => {

                const { data: subscriptionData } = data;

                if (!subscriptionData) return;

                const existing = client.readQuery<GetConversationsData>({
                    query: ConversationOperations.Queries.getConversations
                })

                if (!existing) return

                const {getConversations} = existing;
                const {conversationDeleted: { id: deleteConversationId }} = subscriptionData

                client.writeQuery<GetConversationsData>({
                    query: ConversationOperations.Queries.getConversations,
                    data: {
                        getConversations: getConversations.filter(
                            (conversation) => conversation.id === deleteConversationId)
                    }
                })

                router.push("/")
            }
        })

    const onClickConversation = async (
        conversationId: string,
        hasSeenLatestMessage: boolean
    ) => {
        // push the conversationId to the router
        router.push({ query: { conversationId } });

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
                    data: { conversationCreated: ConversationPopulated }
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
            display={{ base: conversationId ? 'none' : 'flex', md: 'flex' }}
            width={{ base: '100%', md: "400px" }}
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
                    onClickConversation={onClickConversation} />
            )}
        </Box>
    );
}
export default ConversationsWrapper;