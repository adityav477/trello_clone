import { apiPrivate } from "@/hooks/api";
import { Outlet, useNavigate } from "react-router-dom";

import { useEffect, useContext } from "react"
import { AuthContext } from "@/context/AuthProvider";

function AuthComponent() {
  const auth = useContext(AuthContext);
  // useEffect(() => {
  //   if (auth.auth.accessToken) {
  //     setAccess(auth.auth.accessToken);
  //   } else {
  //     getAccessToken().then((response) => {
  //       console.log("respsonse Home:", response);
  //     })
  //   }
  // }, [auth.auth.accessToken]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.auth.accessToken) {
      auth.setIsLoading(true);
      const getResponse = async () => {
        try {
          const response = await apiPrivate.get("/auth/accessToken")
          console.log("response Home:", response);
          if (response.status == 200) {
            if (response.headers['x-new-access-token']) {
              const newAccessToken = response.headers['x-new-access-token'];
              console.log("newAccessToken:", newAccessToken);

              auth.setAuth(
                { accessToken: newAccessToken },
              )
            }
          }
        } catch (error: any) {
          console.log(error);
          if (error.status == 401 || error.status == 402) {
            navigate("/login");
          }
        } finally {
          auth.setIsLoading(false);
        }
      }
      getResponse();
    } else {
      console.log("auth is present:", auth.auth.accessToken);
    }

    return () => {
      auth.setIsLoading(false);
    }
  }, [])

  return (
    auth?.isLoading ? <div>isLoading</div> : <Outlet />
  )
}

export default AuthComponent; 
