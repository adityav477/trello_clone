import useAuth from "./useAuth";
import api from "@/hooks/api";

const useGetAccesstoken = () => {
  const auth = useAuth();

  const getAccessToken = async () => {
    try {
      const response = await api.get("http://localhost:3000/api/auth/accessToken");
      if (response.status === 200) {
        console.log("response useGetAccesstoken:", response);
        auth.setAuth({ accessToken: response.data?.accessToken });
        return response;
      }
    } catch (error) {
      console.log("errorr", error);
    }
  }
  return getAccessToken;
}

export default useGetAccesstoken;
