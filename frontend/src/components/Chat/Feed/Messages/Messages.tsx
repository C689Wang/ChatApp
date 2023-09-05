import { GetMessagesData, GetMessagesInput, MessageSubscriptionData } from "@/util/types";
import { Flex, Stack, useEditable } from "@chakra-ui/react";
import { useQuery } from "@apollo/client"
import MessageOperations from "../../../../graphql/operations/message"
import { toast } from "react-hot-toast";
import SkeletonLoader from "@/components/generic/SkeletonLoader";
import { useEffect } from "react";
import MessageItem from "./MessageItem";

interface MessagesProps {
    userId: string;
    conversationId: string
};

const Messages:React.FC<MessagesProps> = ({ userId, conversationId}) => {
    const { data, loading, error, subscribeToMore } = useQuery<GetMessagesData, GetMessagesInput>(
        MessageOperations.Queries.getMessages,
        {
            variables: {
                conversationId
            },
            onError: ({ message }) => {
                toast.error(message);
            },
        },
    );

    const subscribeToMoreMessages = (conversationId: string) => {
        subscribeToMore({
            document: MessageOperations.Subscriptions.messageSent,
            variables: {
                conversationId
            },
            updateQuery: (prev, { 
                subscriptionData 
                }: MessageSubscriptionData
            ) => {
                if (!subscriptionData.data) return prev;
                const newMessage = subscriptionData.data.messageSent;
                return Object.assign({}, prev, {
                    getMessages: newMessage.sender.id === userId ? prev.getMessages :
                    [newMessage, ...prev.getMessages]
                })
            }
        })
    };

    useEffect(() => {
        subscribeToMoreMessages(conversationId);
     }, [conversationId]);

     if (error) {
        return null;
    }
    
    return (
        <Flex
            direction="column"
            justify="flex-end"
            overflow="hidden"
        >
            {loading && (
                <Stack spacing={4} px={4}>
                    <SkeletonLoader count={4} height="60px" width="100%"></SkeletonLoader>
                </Stack>
            )}
            {data?.getMessages && (
                <Flex 
                    direction="column-reverse" 
                    overflowY="scroll"
                    height="100%"
                >
                    {data.getMessages.map(message => (
                        <MessageItem message={message} sentByMe={message.sender.id === userId} />
                    ))}
                </Flex>

            )}
        </Flex>
    )
}
export default Messages;