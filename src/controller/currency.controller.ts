import { Request, Response } from "express";
import { getAllCurrencies, getCurrencyForUser, getSingleCurrency } from "../service/currency.service";
import { AuthRequest } from "../types/authRequest.type";
import { findUserById } from "../Service/user.service";

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns List of currencies
 */
export const getCurrencies = async (req:Request, res:Response)=>{
    try{
        const currencies = await getAllCurrencies()

        res.send(currencies)

    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Currency object
 */
export const getCurrency = async (req:Request, res:Response)=>{
    try{
        const currency = await getSingleCurrency()

        res.send(currency)

    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Currency object
 */
export const getUserCurrency = async (req:AuthRequest, res:Response)=>{
    try{
        const user = req.tokenAccount
        console.log(user);
        
        const userCurrency = await findUserById(user?.dub.id as number)
        const currency = await getCurrencyForUser(userCurrency?.currency as string)
        console.log(currency)
        res.send(currency)

    }catch(err:any){
        console.log(err)
        res.status(400).json(err)
    }
}
