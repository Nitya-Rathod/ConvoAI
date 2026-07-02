import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = 8080;

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 AI requests per minute
  message: {
    error: "Too many requests. Please wait a minute and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error:
        "You're sending messages too quickly. Please wait a minute and try again.",
    });
  },
});

app.use("/api/chat", chatLimiter);
app.use("/api", chatRoutes); // chat routes
app.use("/api/auth", authRoutes); // auth route

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
