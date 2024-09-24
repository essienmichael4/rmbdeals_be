import { Router } from "express";
import { authenticateAdminToken } from "../middleware/authAdminToken";
import { account, addAccount, updateAccount } from "../controller/account.controller";


const router = Router()

router.get("/announcements", account)
router.post("/announcements", authenticateAdminToken, addAccount)
router.put("/announcements/1", authenticateAdminToken, updateAccount)
// router.put("/announcements/1/show", authenticateAdminToken, )

export default router
