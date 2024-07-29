import { Request, Response } from "express";
import { AuthRequest } from "../types/authRequest.type";
import { getHistoryData, getPeriods, getUserStatistics } from "../service/stats.service";
import { fetchUserRecentOrders } from "../service/order.service";

export const getStatistics = async (req:AuthRequest, res:Response) => {
    try{
        const user = req.tokenAccount
        const { from, to} =  req.query

        const result = await getUserStatistics(user?.dub.id as number, new Date(from as string), new Date(to as string))

        res.send(result)
    }catch(err){
        res.status(400).json(err)
    }
}

export const getHistory = async (req:AuthRequest, res:Response) => {
    try{
        const { year, month} =  req.query
        const user = req.tokenAccount
        const timeframe:"MONTH" | "YEAR" = req.query.timeframe as "MONTH" | "YEAR"        
    
        if(Number(month) < 0 || Number(month) > 11){
            return res.status(400).json({message: "Month should be a valid month"})
        }
    
        const result = await getHistoryData(timeframe, Number(month), Number(year),user?.dub.id)
    
        res.send(result)
    }catch(err){
        console.log(err)
        res.status(400).json(err)
    }
}

export const getHistoryPeriods = async (req:Request, res:Response) => {
    try{
        const periods = await getPeriods() 
        res.send(periods)
    }catch(err){
        res.status(400).json(err)
    }
    
}

export const getRecentOrders = async (req:AuthRequest, res:Response) => {
    try{
        const user = req.tokenAccount
        const result = await fetchUserRecentOrders(user?.dub.id as number)
    
        res.send(result)
    }catch(err){
        res.status(400).json(err)
    }
}
