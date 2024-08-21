import { Response } from "express";
import bcrypt from 'bcrypt'
import { AuthRequest } from "../types/authRequest.type";
import { findUserByEmail, findUserById, updateCurrency, updatePassword, updateUserAccountInfo } from "../Service/user.service";
import { generateJWT } from "../service/helpers";

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing a User and JWT tokens
 */
export const getUserInfo = async (req:AuthRequest, res:Response)=>{
    try{
        const user = req.tokenAccount

        const userInfo = findUserById(user?.dub.id as number)

        res.send(userInfo)
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
export const updateUserInfo = async (req:AuthRequest, res:Response)=>{
    try{
        const userAccount = req.tokenAccount
        const {name, email} = req.body

        const user = await updateUserAccountInfo(userAccount?.dub.id as number, name, email)
        delete (user as any).password
        delete (user as any).orders
        delete (user as any).currencies
        delete (user as any).currencyUpdates

        res.send({
            user,
            backendTokens: {
                accessToken: generateJWT(user.email, user.id,user.name, '1h'),
                refreshToken: generateJWT(user.email, user.id,user.name, '7d')
            }
        })
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
export const updateUserCurrency = async (req:AuthRequest, res:Response)=>{
    try{
        const userAccount = req.tokenAccount
        const {currency} = req.body
        const userCurrency = await updateCurrency(Number(userAccount?.dub.id), currency)
        res.send({message: "Currency added successfully"})
    }catch(err:any){
        res.status(400).json(err)
    }
}

/**
 * 
 * @param req Request Object
 * @param res Response Object
 * @returns Object containing User info 
 */
export const updateUserPassword = async (req:AuthRequest, res:Response)=>{
    try{
        const userAccount = req.tokenAccount
        const {currentPassword, newPassword, confirmPassword} = req.body

        let user = await findUserByEmail(userAccount?.username as string)
        if(!user){
            return res.status(401).json({error: "User does not exist."})
        }

        let passVerify = await bcrypt.compare(currentPassword, user.password)
        
        if(!passVerify){
            return res.status(401).json({error: "Current password does not match with the existing password."})
        }

        if(!currentPassword){
            return res.status(401).json({error: "Current passwords is need not match."})
        }

        if(newPassword !== confirmPassword){
            return res.status(401).json({error: "Passwords do not match."})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        const updatedUser = await updatePassword(userAccount?.dub.id as number, hashedPassword)
        delete (updatedUser as any).password
        delete (updatedUser as any).orders
        delete (updatedUser as any).currencies
        delete (updatedUser as any).currencyUpdates

        res.send(updatedUser)
    }catch(err:any){
        res.status(400).json(err)
    }
}
