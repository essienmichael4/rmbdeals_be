import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer';
import { AuthRequest } from "../types/authRequest.type";
import { Role } from "@prisma/client";
import { generateJWT } from "../service/helpers";
import { getCurrency } from "../service/currency.service";
import { addOrderBilling, addOrderBillingNonUser, checkoutLoginOrderUpdate, createOrderForUnknownUser, createOrderForUser, fetchOrdersRevenue, fetchUserOrder, fetchUserOrderforCheckout, fetchUserOrders, updateUserOrder } from "../service/order.service";
import { createNewUser, findUserByEmail } from "../service/user.service";
import axios from "axios";
import FormData from 'form-data';
import { getAccount } from "../service/account.service";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a User and JWT tokens
 */
export const createOrder = async (req:AuthRequest, res:Response)=>{
    try{
        const file: Express.Multer.File | undefined = req.file;
        const data:{account: string, currency: string, amount: number, recipient:string} = JSON.parse(req.body.order)
        const user = req.tokenAccount

        const form = new FormData();
        form.append('image', file!.buffer.toString('base64'));
        form.append('key', process.env.IMBDB_API_KEY);
        form.append('expiration', 86400);
        const response = await axios.post("https://api.imgbb.com/1/upload", form, {
            headers: {
                'content-type': 'multipart/form-data'
            },
        });

        const currencyInfo = await getCurrency(data.currency)
        if(!currencyInfo){
            return res.status(404).json({error: "The transacted currency was not found"})
        }

        const result = await createOrderForUser(data.account, data.amount,currencyInfo.rate, data.recipient, data.currency, response.data?.data?.url, user!.dub.id) 
        const order = result[0]
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
        const file: Express.Multer.File | undefined = req.file;
        // console.log('Uploaded File:', file);

        const data:{account: string, currency: string, amount: number, recipient:string} = JSON.parse(req.body.order)

        const form = new FormData();
        form.append('image', file!.buffer.toString('base64'));
        form.append('key', process.env.IMBDB_API_KEY);
        form.append('expiration', 86400);
        const response = await axios.post("https://api.imgbb.com/1/upload", form, {
            headers: {
                'content-type': 'multipart/form-data'
            },
        });

        const currencyInfo = await getCurrency(data.currency)
        if(!currencyInfo){
            return res.status(404).json({error: "The transacted currency was not found"})
        }

        const order = await createOrderForUnknownUser(data.account, data.amount,currencyInfo.rate, data.recipient, data.currency, response.data?.data?.url) 
        delete (order as any).userId
        res.send({order, message: "Order saved successfully"})

    }catch(err:any){
        console.log(err);
        
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

        const order = await fetchUserOrderforCheckout(Number(id))
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

        const order = await fetchUserOrderforCheckout(Number(id), user?.dub.id)
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
        const {email, momoName, whatsapp, name, notes} = req.body
        const user = req.tokenAccount
        
        const order = await addOrderBilling(Number(id), name, email, whatsapp, momoName, notes, user?.dub.id)
        delete (order as any).userId
        
        res.send({order, message:"Order placed successfully"})
        const account = await getAccount()

        const { to, subject, text } = {
            to: email,
            subject: "RMDDEALS - YOUR ORDER",
            text: `
                Your order with ID: ${order.id} for RMB ${order.rmbEquivalence} at ${order.currency}  ${order.amount} has been placed successfully.
                Please make a payment of ${order.currency} ${order.amount} with refernce ${order.id} to the account: ${account!.number} with reference name: ${account!.name} to proceed with the order processing.
                If no payment is made the order would be automatically cancelled at 12:00 am GMT.

                Thank you.
            `
        }

        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
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
        const {email, momoName, whatsapp, name, notes, password} = req.body
        const role:Role = process.env.USERROLE as Role

        const userExist = await findUserByEmail(email)
        if(userExist){
            return res.status(401).json({error: "Email already exist."})
        }
        if(!password){
            return res.status(401).json({error: "Password is needed of this operation."})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const savedOrder = await fetchUserOrderforCheckout(Number(id))
        const user = await createNewUser(name, email, role, hashedPassword, savedOrder?.currency) 
        delete (user as any).password
        delete (user as any).orders
        delete (user as any).currencies
        delete (user as any).currencyUpdates

        const order = await addOrderBillingNonUser(Number(id),name,email,whatsapp, momoName, user.id, savedOrder!.amount, notes )
        delete (order[0] as any).userId

        res.send({
            order: order[0], message:"Order placed successfully",
            user,
            backendTokens: {
                accessToken: generateJWT(user.email, user.id,user.name, '1h'),
                refreshToken: generateJWT(user.email, user.id,user.name, '7d')
            }
        })

        const account = await getAccount()

        const { to, subject, text } = {
            to: email,
            subject: "RMDDEALS - YOUR ORDER",
            text: `
                Your order with ID: ${order[0].id} for RMB ${order[0].rmbEquivalence} at ${order[0].currency}  ${order[0].amount} has been placed successfully.
                Please make a payment of ${order[0].currency} ${order[0].amount} with refernce ${order[0].id} to the account: ${account!.number} with reference name: ${account!.name} to proceed with the order processing.
                If no payment is made the order would be automatically cancelled at 12:00 am GMT.

                Thank you.
            `
        }

        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
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
 * @returns Object containing a Users information and tokens for authentication and authorization 
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

        const savedOrder = await fetchUserOrderforCheckout(Number(id))
        const order = await checkoutLoginOrderUpdate(Number(id), user.id, savedOrder!.amount)

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

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns List containing a Users orders
 */
export const getUserOrders = async (req:AuthRequest, res:Response) => {
    try{
        const user = req.tokenAccount
        const orders = await fetchUserOrders(user?.dub.id as number)
    
        res.send(orders)
    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns List containing a Users orders
 */
export const getOrders = async (req:AuthRequest, res:Response) => {
    try{
        const user = req.tokenAccount
        const orders = await fetchUserOrders()
    
        res.send(orders)
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
export const getOrderForAdmin = async (req:AuthRequest, res:Response) => {
    try{
        const {id} = req.params
        const user = req.tokenAccount

        const order = await fetchUserOrder(Number(id))
    
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
export const getUserOrder = async (req:AuthRequest, res:Response) => {
    try{
        const {id} = req.params
        const user = req.tokenAccount

        const order = await fetchUserOrder(Number(id), user?.dub.id as number)
    
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
export const updateOrder = async (req:AuthRequest, res:Response) => {
    try{
        const {id} = req.params
        const user = req.tokenAccount
        const {status} = req.body

        const order = await updateUserOrder(Number(id), status)
    
        res.send(order)
    }catch(err:any){
        res.status(400).json(err)
    }
}


/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns List containing a Users orders
 */
export const getOrdersRevenue = async (req:AuthRequest, res:Response) => {
    try{
        const user = req.tokenAccount
        const { from, to} =  req.query
    
        const revenue = await fetchOrdersRevenue(new Date(from as string), new Date(to as string))

        res.send(revenue)
    }catch(err:any){
        console.log(err);
        
        res.status(400).json(err)
    }
}
