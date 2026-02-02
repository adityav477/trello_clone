import { Router } from "express";
import { loginUser } from "../controllers/signin_signup.js";

const router = Router();

router.post("/", loginUser);

export default router;
