import { Request, Response } from "express";
import { createCurrency, getAllCurrencies, getCurrencyForUser, getSingleCurrency, updateExistingCurrency } from "../service/currency.service";
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
        
        const userCurrency = await findUserById(user?.dub.id as number)
        const currency = await getCurrencyForUser(userCurrency?.currency as string)
        res.send(currency)

    }catch(err:any){
        console.log(err)
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Currency object
 */
export const addCurrency = async (req:AuthRequest, res:Response)=>{
    try{
        const user = req.tokenAccount
        const {label, currency, description, rate} = req.body
                
        const newCurrency = await createCurrency(user?.dub.id as number, label, currency, Number(rate), description)
        res.send(newCurrency)

    }catch(err:any){
        console.log(err)
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Currency object
 */
export const updateCurrency = async (req:AuthRequest, res:Response)=>{
    try{
        const user = req.tokenAccount
        const {label, currency, description, rate} = req.body

        const currencyRate = await getCurrencyForUser(currency)

        const updatedCurrency = await  updateExistingCurrency(user?.dub.id as number, currencyRate!.rate, currency , label || currencyRate?.label, rate, description || currencyRate?.description)
        res.send(updatedCurrency)

    }catch(err:any){
        console.log(err)
        res.status(400).json(err)
    }
}


