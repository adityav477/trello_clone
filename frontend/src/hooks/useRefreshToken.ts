import api from "./api.ts";

const useRefreshToken = () => {
  const refresh = async () => {
    const response = await api.get("/refresh", {
      withCredentials: true
    })
    return response.data.accessToken;
  }
  return refresh;
}

export default useRefreshToken;
