import { CreateUsernameData, CreateUsernameVariables } from "@/util/types";
import { useMutation } from "@apollo/client";
import { Button, Center, Stack, Text, Image, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import UserOperations from "../../graphql/operations/user";

interface IAuthProps {
    session: Session | null;
    reloadSession: () => void;
}

const Auth: React.FunctionComponent<IAuthProps> = ({ session, reloadSession }) => {
    const [username, setUsername] = useState("");

    const [createUsername, { loading, error }] = useMutation
        <CreateUsernameData, 
        CreateUsernameVariables>
        (UserOperations.Mutations.createUsername)

    const onSubmit = async () => {
        if (!username) return;
        try {
            // createUsername mutation to send username to the GraphQL API
            const { data } = await createUsername({ variables: { username }});  
            if (!data?.createUsername) {
                throw new Error();
            }

            if (data.createUsername.error) {
                const { 
                    createUsername: { error },       
                } = data;
                throw new Error(error);
            }

            toast.success('Username created!')

            // Reload automatically to obtain created username
            reloadSession();
        } catch (error: any) {
            toast.error(error?.message)
            console.log("onSubmit error", error);
        }
    }
    return (
        <Center height="100vh">
            <Stack spacing={8} align='center'>
                {session ? (
                    <>
                        <Text fontSize="3xl">Create a Username</Text>
                        <Input 
                            placeholder="Enter a Username" 
                            value={username} 
                            onChange={(event) => setUsername(event.target.value)}>
                        </Input>
                        <Button width="100%" onClick={onSubmit} isLoading={loading}>Save</Button>
                    </>
                ) : (
                    <>
                        <Text fontSize="3xl">MessengerQL</Text>
                        <Button
                            onClick={() => signIn('Google')}
                            leftIcon={<Image height="20px" />}
                        >
                            Continue with Google
                        </Button>
                    </>
                )}
            </Stack>
        </Center>
        // <div>
        //     <Button onClick={() => signIn('Google')}>
        //         Sign In
        //     </Button>
        // </div>
    );
};

export default Auth;

