import { GetMessagesData, SendMessageData, SendMessageInput } from "@/util/types";
import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import MessageOperations from "../../../../graphql/operations/message"


interface MessageInputProps {
    conversationId: string;
};

const MessageInput:React.FC<MessageInputProps> = ({ conversationId }) => {
    const { data: session } = useSession();
    const { user: {id: senderId, username }} = session as Session;

    const [messageBody, setMessageBody] = useState("");
    const [sendMessage] = useMutation<SendMessageData, SendMessageInput>(MessageOperations.Mutations.sendMessage)

    const onSendMessage = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            // call sendMessage mutation
            const newMessage: SendMessageInput = {
                senderId,
                conversationId,
                body: messageBody
            }

            setMessageBody("");

            const { data, errors } = await sendMessage({
                variables: {
                    ...newMessage
                },
                optimisticResponse : {
                    sendMessage: true
                },
                update: (cache) => {
                    const existing = cache.readQuery<GetMessagesData>({
                        query: MessageOperations.Queries.getMessages,
                        variables: { conversationId }
                    }) as GetMessagesData;

                    cache.writeQuery<GetMessagesData, { conversationId: string }>({
                        query: MessageOperations.Queries.getMessages,
                        variables: { conversationId },
                        data: {
                            ...existing,
                            getMessages: [{
                                body: messageBody,
                                senderId,
                                conversationId,
                                sender: {
                                    id: senderId,
                                    username
                                },
                                createdAt: new Date(Date.now()),
                                updatedAt: new Date(Date.now()),
                                id : "temp-id",
                            },  ...existing.getMessages]
                        }
                    })
                }
            })
            if (!data?.sendMessage || errors) {
                throw new Error("Failed to send message")
            }
        } catch (error: any) {
            console.log("onSendMessage error", error);
            toast.error(error?.message);
        }
    }
    
    return (
        <Box px={4} py={6} width="100%">
            <form onSubmit={onSendMessage}>
                <Input 
                    value={messageBody} 
                    size="md"
                    placeholder="New message"
                    onChange={(event) => setMessageBody(event.target.value)}
                    resize='none'
                    _focus={{
                        boxShadow: "none",
                        outline: 'none',
                        border: '1px solid',
                        borderColor: 'whiteAlpha.300'
                    }}
                >
                </Input>
            </form>
        </Box>
    )
}
export default MessageInput;