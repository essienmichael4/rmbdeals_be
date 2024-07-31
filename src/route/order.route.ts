import { Router } from "express";
import multer from 'multer'
import { checkoutLogin, checkoutNonUserOrder, checkoutUserOrder, createOrder, createUnkownOrder, getNonUserOrderForCheckout, getOrderForAdmin, getOrders, getUserOrder, getUserOrderForCheckout, getUserOrders } from "../controller/order.controller";
import path from "path";
import { authenticateToken } from "../middleware/authToken.middleware";
import { authenticateAdminToken } from "../middleware/authAdminToken";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({ storage: storage })

const router = Router()

router.post("/orders/nonuser", upload.single('qrcode'), createUnkownOrder)
router.post("/orders", authenticateToken, upload.single('qrcode'), createOrder)
router.post("/orders/checkout/login/:id", checkoutLogin)
router.post("/orders/checkout/:id", authenticateToken, checkoutUserOrder)
router.post("/orders/checkout-register/:id", checkoutNonUserOrder)
router.get("/orders/checkout/info/:id", authenticateToken, getUserOrderForCheckout)
router.get("/orders/checkout/info/nonuser/:id", getNonUserOrderForCheckout)
router.get("/orders", authenticateToken, getUserOrders)
router.get("/orders-admin", authenticateAdminToken, getOrders)
router.get("/orders/:id", authenticateToken, getUserOrder)
router.get("/orders-admin/:id", authenticateAdminToken, getOrderForAdmin)

export default router
