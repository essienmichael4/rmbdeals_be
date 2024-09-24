import { Router } from "express";
import { addAnnouncement, announcement, updateAnnouncement, updateAnnouncementShowStatus } from "../controller/announcement.controller";
import { authenticateAdminToken } from "../middleware/authAdminToken";


const router = Router()

router.get("/announcements", announcement)
router.post("/announcements", authenticateAdminToken, addAnnouncement)
router.put("/announcements/1", authenticateAdminToken, updateAnnouncement)
router.put("/announcements/1/show", authenticateAdminToken, updateAnnouncementShowStatus)

export default router
