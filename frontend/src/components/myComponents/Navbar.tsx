import { Trello } from "lucide-react"
import { User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="m-5">
      <div className="flex justify-between">
        {/* title */}
        <h1 className="flex items-center text-2xl gap-2">
          <Trello className="size-9 h-auto text-blue-900" />
          {/* <span className="font-semibold text-3xl bg-clip-text text-transparent bg-linear-to-bl from-indigo-500 via-purple-500 to-pink-500">Trello Clone</span> */}
          <span className="font-semibold text-3xl sm:text-4xl text-blue-700">Trello Clone</span>
        </h1>

        <div className="flex justify-end items-center my-2 gap-3 sm:gap-5">

          <span>
            <Link to="/dashboard">
              Dashboard
            </Link>
          </span>

          <span>
            <Link to="/login">
              Login
            </Link>
          </span>

          <span>
            <Link to="/signup">
              Signup
            </Link>
          </span>
          <span className="bg-gray-200 rounded-4xl p-1">
            <User className="size-7 text-blue-700" />
          </span>
        </div>

      </div>
    </div>
  )
}
