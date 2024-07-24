import { Router } from "express";
import { createUser, loginUser, refreshToken} from "../controller/auth.controller";
import { authenticateRefreshToken } from "../middleware/authRefresh.middleware";

const router = Router()

router.post("/auth/register", createUser)
router.post("/auth/login", loginUser)
router.post("/auth/refresh-token", authenticateRefreshToken, refreshToken)

export default router
