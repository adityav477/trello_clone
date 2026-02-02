import jwt from "jsonwebtoken";
import { jwt_access_token_secret, jwt_refresh_token_secret } from "../config/server-config.js";


export const getRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  console.log("cookies:", cookies);

}
export const getAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  // console.log("refresh getAccess", refreshToken);

  if (!refreshToken) {
    return res.status(401).json({
      msg: "Authentication Failed No refreshToken",
    });
  }

  try {
    const decoded_refresh_token = jwt.verify(refreshToken, jwt_refresh_token_secret);
    // console.log("decoded_access_token: ", decoded_refresh_token);

    req.user = decoded_refresh_token;
    let accessToken = jwt.sign(decoded_refresh_token, jwt_access_token_secret);
    // console.log("newAccesssToken", accessToken);

    res.setHeader("x-new-access-token", accessToken);
    res.status(200).json({
      message: "Authenticated"
    })
  } catch (error) {
    return res.status(402).json({
      error: "Not valid RefreshToken",
    })
  }
}

