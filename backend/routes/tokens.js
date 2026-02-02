import { Router } from "express";
import cookieParser from "cookie-parser";
import { getRefreshToken, getAccessToken } from "../controllers/tokens.js";

const router = Router();

router.use(cookieParser());
router.get("/accessToken", getAccessToken);
export default router;
