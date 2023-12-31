import Auth from "@/components/Auth/Auth";
import Chat from "@/components/Chat/Chat";
import { Box } from "@chakra-ui/react";
import { NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { Session } from "next-auth";




export default function Home() {
  const { data: session } = useSession();
  console.log("here is", session)

  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  }
  return (
    <Box>
      {session?.user?.username ? (
        <Chat session={session}/>
      ) : <Auth session={session} reloadSession={reloadSession} />}
    </Box>
  )

  // <div>
  //   { data?.user ? (
  //     <button onClick={() => signOut()}>Sign Out</button>
  //     ) : (
  //     <button onClick={() => signIn("google")}>Sign In</button>)
  //   }    
  //   {data?.user?.name}
  // </div>
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  return {
    props: {
      session
    }
  };
}