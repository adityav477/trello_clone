import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider";

const useAuth = () => {
  const { auth, setAuth, isLoading, setIsLoading
  } = useContext(AuthContext);

  return { auth, setAuth, isLoading, setIsLoading };
}

export default useAuth;
