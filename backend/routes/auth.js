import express from "express";
import { signup, login, logout } from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";
import { getCurrentUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, getCurrentUser);

export default router;
