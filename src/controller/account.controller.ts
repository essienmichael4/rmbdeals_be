import { Request, Response } from "express";
import { AuthRequest } from "../types/authRequest.type";
import { createAccount, getAccount, updateExistingAccount } from "../service/account.service";

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing an announcement
 */
export const account = async (req:Request, res:Response) => {
    try{
        const found = await getAccount()
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
export const addAccount = async (req:AuthRequest, res:Response) => {
    try{
        const user = req.tokenAccount
        const {name, number} = req.body

        const announcement = await createAccount(Number(user?.dub.id), name, number)
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
export const updateAccount = async (req:AuthRequest, res:Response) => {
    try{
        const user = req.tokenAccount
        const {name, number} = req.body

        const updated = await updateExistingAccount(Number(user?.dub.id), name, number)

        return res.send(updated)
    }catch(err:any){
        res.status(400).json(err)
    }
}
