import prisma from "../config/prisma-signleton.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as z from "zod";
import { jwt_access_token_secret, jwt_refresh_token_secret } from "../config/server-config.js";

export const registerUser = async (req, res) => {
  const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })

  try {
    const data = signupSchema.parse(req.body);
    console.log("zod data:", data);
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    console.log("existingUser:", existingUser);

    if (existingUser) {
      return res.stauts(400).json({ error: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    //     console.log("user:", user);
    //      {
    //   id: '441546e3-d483-4b46-ad51-c488b41e8333',
    //   email: 'aditya@gmail.com',
    //   name: 'aditya',
    //   password: '$2b$10$lf1rQ/YR2LS6nQLshWHD3unoFzBtlsEGpAT3qzBGTZkbJZT4M42.W',
    //   account: 'FREE',
    //   createdAt: 2026-01-26T19:58:35.913Z
    // }

    const accessToken = jwt.sign({ userId: newUser.id }, jwt_access_token_secret, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: newUser.id }, jwt_refresh_token_secret, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.setHeader('x-new-access-token', accessToken);
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (error) {
    console.log("error:", error);
    res.status(500).send({
      "error": error
    })
  }
}

export const loginUser = async (req, res) => {
  const signinSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })

  try {
    const data = signinSchema.parse(req.body);
    console.log("zod data:", data);
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    console.log("existingUser:", existingUser);

    if (!existingUser) {
      console.log("User not found");
      return res.status(404).json({ error: "User doesn't Exists" });
    }

    const passwordCheck = await bcrypt.compare(password, existingUser?.password);

    if (!passwordCheck) {
      return res.status(405).json({ error: "Wrong Password" });
    }

    const accessToken = jwt.sign({ userId: existingUser.id }, jwt_access_token_secret, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: existingUser.id }, jwt_refresh_token_secret, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.setHeader('x-new-access-token', accessToken);
    return res.status(200).json({
      message: "Login successfull",
      user: {
        id: existingUser.id,
        email: existingUser.email,
        account: existingUser.account
      }
    });

  } catch (error) {
    console.log("error:", error);
    res.status(500).send({
      "error": error
    })
  }
}

