
'use client'

import { Button } from "~/components/ui/button";
import { DataTable } from "../components/data-table";
import { useState } from "react";

export default function Home() {

  const [isLogged, setIsLogged] = useState(false);

  const handleLogin = () => {
    setIsLogged(true);
  }

  
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
            <Button variant={'default'} className="w-56 shadow-lg" onClick={handleLogin}>Login with Mistwood</Button>
          </div>

      )
    }
      
    </div>
  </div>
  )
}
