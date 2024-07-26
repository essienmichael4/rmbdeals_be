import { Router } from "express";
import { authenticateToken } from "../middleware/authToken.middleware";
import { updateUserInfo, updateUserPassword } from "../controller/user.controller";

const router = Router()

router.post("/users/account", authenticateToken, )
router.put("/users/account", authenticateToken, updateUserInfo)
router.put("/users/password", authenticateToken, updateUserPassword)

export default router
