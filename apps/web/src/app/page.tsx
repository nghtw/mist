'use client'

import { DataTable } from "../components/data-table";

export default function Home() {


  
 // komponenty zostaną przeniesione do osobnego folderu.
  return(
  <div className="w-full flex justify-center">
    <div className="w-3/4">
      <DataTable />
    </div>
  </div>
  )
}
