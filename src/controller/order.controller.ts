import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { AuthRequest } from "../types/authRequest.type";
import { Role } from "@prisma/client";
import { generateJWT } from "../service/helpers";
import { getCurrency } from "../service/currency.service";
import { addOrderBilling, addOrderBillingNonUser, checkoutLoginOrderUpdate, createOrderForUnknownUser, createOrderForUser, fetchUserOrder } from "../service/order.service";
import log from "../utils/logger";
import { createNewUser, findUserByEmail } from "../Service/user.service";

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a User and JWT tokens
 */
export const createOrder = async (req:AuthRequest, res:Response)=>{
    try{
        const data:{account: string, currency: string, amount: number, recipient:string} = JSON.parse(req.body.order)
        const user = req.tokenAccount

        const currencyInfo = await getCurrency(data.currency)
        if(!currencyInfo){
            return res.status(404).json({error: "The transacted currency was not found"})
        }

        const order = await createOrderForUser(data.account, data.amount,currencyInfo.rate, data.recipient, data.currency, `uploads/${req.file?.filename}`, user!.dub.id) 
        delete (order as any).userId
       res.send({order, message: "Order saved successfully"})

    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a User and JWT tokens
 */
export const createUnkownOrder = async (req:Request, res:Response)=>{
    try{
        const data:{account: string, currency: string, amount: number, recipient:string} = JSON.parse(req.body.order)

        const currencyInfo = await getCurrency(data.currency)
        if(!currencyInfo){
            return res.status(404).json({error: "The transacted currency was not found"})
        }

        const order = await createOrderForUnknownUser(data.account, data.amount,currencyInfo.rate, data.recipient, data.currency, `uploads/${req.file?.filename}`) 
        delete (order as any).userId
       res.send({order, message: "Order saved successfully"})

    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a Users order
 */
export const getNonUserOrderForCheckout = async (req:Request, res:Response)=>{
    try{
        const {id} = req.params

        const order = await fetchUserOrder(Number(id))
        delete (order as any).userId
        delete (order as any).qrCode
        delete (order as any).status
        
        res.send(order)
    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a Users order
 */
export const getUserOrderForCheckout = async (req:AuthRequest, res:Response)=>{
    try{
        const {id} = req.params
        const user = req.tokenAccount

        const order = await fetchUserOrder(Number(id), user?.dub.id)
        delete (order as any).userId
        delete (order as any).qrCode
        delete (order as any).status
        
        res.send(order)
    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a Users order
 */
export const checkoutUserOrder = async (req:AuthRequest, res:Response)=>{
    try{
        const {id} = req.params
        const {email, momoNumber, whatsapp, name, notes} = req.body
        const user = req.tokenAccount

        const order = await addOrderBilling(Number(id),name,email,whatsapp, momoNumber, notes)

        res.send({order, message:"Order placed successfully"})
    }catch(err:any){
        if(err.meta.modelName === "Order"){
            res.status(404).json("No order record was found with the ID associated with this account")
        }else{
            res.status(400).json(err)
        }
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a Users order
 */
export const checkoutNonUserOrder = async (req:Request, res:Response)=>{
    try{
        const {id} = req.params
        const {email, momoNumber, whatsapp, name, notes, password} = req.body
        const role:Role = process.env.USERROLE as Role

        const userExist = await findUserByEmail(email)
        if(userExist){
            return res.status(401).json({error: "Email already exist."})
        }
        if(!password){
            return res.status(401).json({error: "Password is needed of this operation."})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await createNewUser(name, email, role, hashedPassword) 
        delete (user as any).password
        delete (user as any).orders
        delete (user as any).currencies
        delete (user as any).currencyUpdates

        const order = await addOrderBillingNonUser(Number(id),name,email,whatsapp, momoNumber, notes, user.id)

        res.send({
            order, message:"Order placed successfully",
            user,
            backendTokens: {
                accessToken: generateJWT(user.email, user.id,user.name, '1h'),
                refreshToken: generateJWT(user.email, user.id,user.name, '7d')
            }
        })
    }catch(err:any){
        if(err.meta.modelName === "Order"){
            res.status(404).json("No order record was found with the ID associated with this account")
        }else{
            res.status(400).json(err)
        }
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a Users order
 */
export const checkoutLogin = async (req:Request, res:Response)=>{
    try{
        const {id} = req.params
        const {email, password} = req.body

        let user = await findUserByEmail(email)
        if(!user){
            return res.status(401).json({error: "User does not exist."})
        }

        let passVerify = await bcrypt.compare(password, user.password)
        
        if(!passVerify){
            return res.status(401).json({error: "User credentials invalid."})
        }

        delete (user as any).password

        const order = await checkoutLoginOrderUpdate(Number(id), user.id)
        
        res.send({
            user,
            backendTokens: {
                accessToken: generateJWT(user.email, user.id, user.name, '1h'),
                refreshToken: generateJWT(user.email, user.id, user.name, '7d')
            }
        })

    }catch(err:any){
        if(err.meta.modelName === "Order"){
            res.status(404).json("No order record was found with the ID associated with this account")
        }else{
            res.status(400).json(err)
        }
    }
}
