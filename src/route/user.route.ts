import { Router } from "express";
import { authenticateToken } from "../middleware/authToken.middleware";
import { updateUserCurrency, updateUserInfo, updateUserPassword } from "../controller/user.controller";

const router = Router()

// router.post("/users/account", authenticateToken, )
router.put("/users/account", authenticateToken, updateUserInfo)
router.put("/users/password", authenticateToken, updateUserPassword)
router.put("/users/currency", authenticateToken, updateUserCurrency)

export default router
