import useAuth from "./useAuth";
import { useEffect } from "react";
import { apiPrivate } from "./api";

const useAxiosPrivate = () => {
  const auth = useAuth();
  useEffect(() => {
    const requestIntercept = apiPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.auth.accessToken}`
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiPrivate.interceptors.request.eject(requestIntercept);
    }
  }, [auth.auth]);

  return apiPrivate;
}

export default useAxiosPrivate;
