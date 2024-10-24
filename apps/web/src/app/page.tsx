
'use client'

import { Button } from "~/components/ui/button";
import { DataTable } from "../components/data-table";
import { useState } from "react";
import { useSession } from "~/components/providers/session-provider";

export default function Home() {

  const [isLogged, setIsLogged] = useState(false);

  const handleLogin = () => {
    setIsLogged(true);
  }

  const { user, session } = useSession();

  console.log('user', user);
  console.log('session', session);
 // komponenty zostaną przeniesione do osobnego folderu.
  return(
  <div className="w-full flex justify-center">
    <div className="w-3/4">
    {
      isLogged ? (

        <DataTable />
      ) : (

          <div className="w-full mt-20 flex justify-center flex-col content-center items-center">
            <div className="p-5 pb-10 text-white font-bold text-xl">Zaloguj się aby uzyskać dostęp</div>
            <a href="/login/github">Sign in with GitHub</a>
            <div className="text-white">{user ? 'User: ' + user.username : 'Niezalogowany '}</div> 
            <Button variant={'default'} className="w-56 shadow-lg" onClick={handleLogin}>Login with TEST</Button>
          </div>

      )
    }
      
    </div>
  </div>
  )
}
