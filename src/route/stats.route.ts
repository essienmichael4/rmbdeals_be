import { Router } from "express";
import { authenticateToken } from "../middleware/authToken.middleware";
import { getAdminHistory, getAdminRecentOrders, getAdminStatistics, getHistory, getHistoryPeriods, getRecentOrders, getStatistics } from "../controller/stats.controller";
import { authenticateAdminToken } from "../middleware/authAdminToken";

const router = Router()

router.get("/statistics", authenticateToken, getStatistics)
router.get("/recent-orders", authenticateToken, getRecentOrders)
router.get("/history-data", authenticateToken, getHistory)
router.get("/history-periods", authenticateToken, getHistoryPeriods)
router.get("/statistics-admin", authenticateAdminToken, getAdminStatistics)
router.get("/recent-orders-admin", authenticateAdminToken, getAdminRecentOrders)
router.get("/history-data-admin", authenticateAdminToken, getAdminHistory)
router.get("/history-periods-admin", authenticateAdminToken, getHistoryPeriods)

export default router
