import { Router } from "express";
import { authenticateToken } from "../middleware/authToken.middleware";
import { getHistory, getHistoryPeriods, getRecentOrders, getStatistics } from "../controller/stats.controller";

const router = Router()

router.get("/statistics", authenticateToken, getStatistics)
router.get("/recent-orders", authenticateToken, getRecentOrders)
router.get("/history-data", authenticateToken, getHistory)
router.get("/history-periods", authenticateToken, getHistoryPeriods)

export default router
