
'use client'

import { Button } from "~/components/ui/button";
import { DataTable } from "../components/data-table";
import { useSession } from "~/components/providers/session-provider";
import { destroySession } from "~/server/actions/destroySession";


export default function Home() {


  const { user, session } = useSession();

  //? Z jakiegos powodu nie mozna zaimportowac enum Role z klienta prismy poniewaz powoduje to bład ktory "nidy nie powinien sie wydarzyć"

  const logOutHandler = async () => {
    await destroySession();
    window.location.reload(); 
  }

  console.log('user', user);
  console.log('session', session);
 // komponenty zostaną przeniesione do osobnego folderu.
  return(
  <div className="w-full flex justify-center">
    <div className="w-3/4">
    { 
      session && user && user.role === 'ADMIN' ? (

        <DataTable />
      ) : (

          <div className="w-full mt-20 flex justify-center flex-col content-center items-center">


            <h1 className="text-4xl font-bold text-center text-white/50 mb-10">Welcome!</h1>
            {user && user.role !== 'ADMIN' ? (
              <div className="flex flex-col items-center gap-y-6">
                <div className="text-white text-lg font-semibold">Hello {user.username}, please contact the  administrator for access. 🐉</div>
                <Button className="w-28" onClick={logOutHandler}>Logout</Button>
              </div>
            ) : (
            <a href="/login/github">
              <Button variant={'default'} className="w-56 shadow-lg">Login with Github</Button>
            </a>
            )}

          
            
          </div>

      )
    }
      
    </div>
  </div>
  )
}
