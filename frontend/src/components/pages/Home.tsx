import { apiPrivate } from "@/hooks/api";
import { useNavigate } from "react-router-dom";

import { useEffect, useContext } from "react"
import { AuthContext } from "@/context/AuthProvider";

function Home() {
  return (
    <div>
      <h1>Acess Token</h1>
    </div>
  )
}

export default Home
