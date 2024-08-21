import express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
import log from "./utils/logger"

//Routes
import authRoute from "./route/auth.route"
import orderRoute from "./route/order.route"
import userRoute from "./route/user.route"
import statsRoute from "./route/stats.route"
import currencyRoute from "./route/currency.route"
import annuoncementRoute from "./route/announcement.route"


const port = process.env.PORT || 5001
const app = express()
dotenv.config()

app.use(express.json())
app.use(cors())
app.use(express.static("uploads"))
app.use("/api/v1", authRoute)
app.use("/api/v1", orderRoute)
app.use("/api/v1", userRoute)
app.use("/api/v1", statsRoute)
app.use("/api/v1", currencyRoute)
app.use("/api/v1", annuoncementRoute)

app.listen(port, ()=>{
    log.info(`Server running on port ${port}`);   
    
})
