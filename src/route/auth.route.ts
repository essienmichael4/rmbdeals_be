import { Router } from "express";
import { createUser, forgotPassword, loginUser, refreshToken} from "../controller/auth.controller";
import { authenticateRefreshToken } from "../middleware/authRefresh.middleware";

const router = Router()

router.post("/auth/register", createUser)
router.post("/auth/admin", createUser)
router.post("/auth/login", loginUser)
router.get("/auth/refresh-token", authenticateRefreshToken, refreshToken)
router.post("/auth/forgot-password", forgotPassword)
router.post("/auth/reset-password", forgotPassword)

export default router
