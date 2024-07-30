import { Router } from "express";
import { getCurrencies, getCurrency, getUserCurrency } from "../controller/currency.controller";
import { authenticateToken } from "../middleware/authToken.middleware";

const router = Router()

router.get("/currencies", getCurrencies)
router.get("/currencies/unknown", getCurrency)
router.get("/currencies/user", authenticateToken, getUserCurrency)

export default router
