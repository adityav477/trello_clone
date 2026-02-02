import { Router } from "express";
import { registerUser } from "../controllers/signin_signup.js";

const router = Router();

router.post("/", registerUser)

export default router;
