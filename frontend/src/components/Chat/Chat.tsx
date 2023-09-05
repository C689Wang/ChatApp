import { Button, Flex } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { getSession, signOut } from 'next-auth/react';
import ConversationsWrapper from './Conversations/ConversationsWrapper';
import FeedWrapper from './Feed/FeedWrapper';

interface ChatProps {
  session: Session
}

const Chat: React.FunctionComponent<ChatProps> = ({ session }) => {
  return (
    <Flex height="100vh">
      <ConversationsWrapper session={session} />
      <FeedWrapper />
      {/* <Button onClick={() => signOut()}>Sign Out</Button> */}
    </Flex>
    );
};

export default Chat;
