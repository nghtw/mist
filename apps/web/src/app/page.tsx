'use client'

import { DataTableDemo } from "./table";

export default function Home() {
   
 // komponenty zostaną przeniesione do osobnego folderu.
  return(
  <div className="w-full flex justify-center">
    <div className="w-3/4">
      <DataTableDemo />
    </div>
  </div>
  )
}
