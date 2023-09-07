import { Flex } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react';
import MessageHeader from './Messages/MessageHeader';
import MessageInput from './Messages/MessageInput';
import Messages from './Messages/Messages';
import NoConversationSelected from './NoConversationSelected';

interface FeedWrapperProps {

};

const FeedWrapper: React.FC<FeedWrapperProps> = () => {
    const { data: session } = useSession();
    const { user: { id: userId } } = session as Session;

    const router = useRouter();

    const { conversationId } = router.query;

    return (
        <Flex
            display={{ base: conversationId ? 'flex' : 'none', md: 'flex' }}
            width="100%"
            direction="column">
            {conversationId && typeof conversationId === 'string' ? (
                <>
                    <Flex
                        direction='column'
                        justify='space between'
                        overflow='hidden'
                        flexGrow={1}
                    >
                        <MessageHeader userId={userId} conversationId={conversationId} />
                        <Messages userId={userId} conversationId={conversationId}/>
                    </Flex>
                    <MessageInput conversationId={conversationId} />
                </>
            ) : (
               <NoConversationSelected />
            )}
        </Flex>
    )
}
export default FeedWrapper;