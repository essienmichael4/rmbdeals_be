import { Request, Response } from "express";
import { createAnnouncement, getAnnouncement } from "../service/announcement.service"
import { AuthRequest } from "../types/authRequest.type";

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing an announcement
 */
export const announcement = async (req:Request, res:Response) => {
    try{
        const found = await getAnnouncement()
        return res.send(found)
    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing an announcement
 */
export const addAnnouncement = async (req:AuthRequest, res:Response) => {
    try{
        const user = req.tokenAccount
        const {title, subject} = req.body

        const announcement = await createAnnouncement(Number(user?.dub.id), subject, title)
        return res.send(announcement)
    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing an announcement
 */
export const updateAnnouncement = async (req:Request, res:Response) => {
    try{
        const found = await getAnnouncement()
        return res.send(found)
    }catch(err:any){
        res.status(400).json(err)
    }
}