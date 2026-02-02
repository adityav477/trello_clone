import jwt from "jsonwebtoken";
import { jwt_access_token_secret, jwt_refresh_token_secret } from "../config/server-config.js";

// accessToken based Authorization

const authMiddleware = async (req, res, next) => {
  //TODO: Get Access Token 
  // console.log("in middleware");
  // console.log(req.get('Authorization'));

  let accessToken = req.get('Authorization')?.split(" ")[1];
  // console.log("AccessToken:", accessToken);
  if (accessToken && accessToken !== "undefined") {
    // console.log("accessToken valid");
    try {
      const decoded_access_token = jwt.verify(accessToken, jwt_access_token_secret);

      // console.log("decoded acess in middleware:", decoded_access_token);
      req.user = decoded_access_token;
      return next();
    } catch (error) {
      res.status(405).json({
        error: "User not authenticated",
      });
    }
  } else {
    res.status(406).json({
      error: "No accessToken"
    })
  }
}

export default authMiddleware;
