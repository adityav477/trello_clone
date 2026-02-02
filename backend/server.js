import express from "express";
import attachmentRouter from "./routes/attachments.js";
import cors from "cors";
import loginRoute from "./routes/login.js";
import signupRoute from "./routes/signup.js";
import authRouter from "./routes/tokens.js";
import cookieParser from "cookie-parser";
import kanban from "./routes/kanban.js";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ['x-new-access-token']
}));

// console.log(aws_accessToken, " ", aws_secretKey, " ", bucketName, " ", region);

app.use("/login", loginRoute);
app.use("/signup", signupRoute);

app.use(cookieParser());
app.use("/api", kanban);
// app.get("/home", authMiddleware, (req, res) => {
//   console.log("Reached Home");
//   res.status(200).json({
//     message: "Reached Home",
//   })
// })

app.use("/api/posts", attachmentRouter)

app.use("/auth", authRouter);

app.listen(process.env.PORT || "3000", () => {
  console.log(`Server started at ${process.env.PORT}`)
})
