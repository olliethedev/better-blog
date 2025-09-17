import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function NavBar() {
  return (
    <header className="flex justify-between items-center p-4 bg-secondary border-b sticky top-0 z-10">
      <Button asChild variant="outline">
          <NavLink to="/posts">Blog</NavLink>
        </Button>
        <ModeToggle />
    </header>
  )
}


