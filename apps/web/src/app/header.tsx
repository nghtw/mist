import { Button } from "~/components/ui/button"

function Header() {
  return (
    <div className="w-full my-2 flex justify-center">
        <div className="w-3/4 flex justify-end">
            <Button variant={'default'}>Login with Mistwood</Button>
        </div>
    </div>
  )
}

export default Header