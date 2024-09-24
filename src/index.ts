import express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
import log from "./utils/logger"
import cron from "node-cron"

//Routes
import authRoute from "./route/auth.route"
import orderRoute from "./route/order.route"
import userRoute from "./route/user.route"
import statsRoute from "./route/stats.route"
import currencyRoute from "./route/currency.route"
import announcementRoute from "./route/announcement.route"
import accountRoute from "./route/account.route"
import { autoUpdateOfOrders } from "./service/order.service";


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
app.use("/api/v1", accountRoute)
app.use("/api/v1", announcementRoute)

app.get("/", (req,res)=>{
    res.send("working")
})

app.listen(port, ()=>{
    log.info(`Server running on port ${port}`);   
    
    cron.schedule("0 0 0 * * *", ()=>{
        console.log("------------------------")
        console.log("Running task")
        autoUpdateOfOrders()
    })
})
