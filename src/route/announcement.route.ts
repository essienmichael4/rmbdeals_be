import { Router } from "express";
import { addAnnouncement, announcement, updateAnnouncement } from "../controller/announcement.controller";
import { authenticateAdminToken } from "../middleware/authAdminToken";


const router = Router()

router.get("/announcements", announcement)
router.post("/announcements", authenticateAdminToken, addAnnouncement)
router.put("/announcements/1", authenticateAdminToken, updateAnnouncement)

export default router
