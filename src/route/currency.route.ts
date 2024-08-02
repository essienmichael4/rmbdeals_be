import { Router } from "express";
import { addCurrency, getCurrencies, getCurrency, getUserCurrency, updateCurrency } from "../controller/currency.controller";
import { authenticateToken } from "../middleware/authToken.middleware";
import { authenticateAdminToken } from "../middleware/authAdminToken";

const router = Router()

router.get("/currencies", getCurrencies)
router.get("/currencies/unknown", getCurrency)
router.get("/currencies/user", authenticateToken, getUserCurrency)
router.post("/currencies", authenticateAdminToken, addCurrency)
router.put("/currencies/:id", authenticateAdminToken, updateCurrency)

export default router
