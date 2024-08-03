import { Request, Response } from "express";
import nodemailer from 'nodemailer';
import { createNewUser, findUserByEmail } from "../Service/user.service";
import bcrypt from 'bcrypt'
import { AuthRequest } from "../types/authRequest.type";
import { Role } from "@prisma/client";
import { generateJWT } from "../service/helpers";

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
export const createUser = async (req:Request, res:Response)=>{
    try{
        const {name, email, password, confirmPassword} = req.body
        const role:Role = process.env.USERROLE as Role

        const userExist = await findUserByEmail(email)
        if(userExist){
            return res.status(401).json({error: "Email already exist."})
        }

        if(password !== confirmPassword){
            return res.status(401).json({error: "Passwords do not match."})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await createNewUser(name, email, role, hashedPassword) 
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
export const loginUser = async (req:Request, res:Response)=>{
    try{
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

        res.send({
            user,
            backendTokens: {
                accessToken: generateJWT(user.email, user.id, user.name, '1h'),
                refreshToken: generateJWT(user.email, user.id, user.name, '7d')
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
 * @returns Object containing JWT tokens
 */
export const refreshToken = async (req:AuthRequest, res:Response)=>{
    try{    
        const tokenAccount = req.tokenAccount

        if(!tokenAccount){
            return res.status(401).json({message: "Unauthorized"})
        }

        res.send({
            accessToken: generateJWT(tokenAccount!.username, tokenAccount!.dub.id, tokenAccount!.dub.name, '1h'),
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
export const createAdmin = async (req:Request, res:Response)=>{
    try{
        const {name, email} = req.body
        const password:string = process.env.PASSWORD as string
        const role:Role = process.env.ADMINROLE as Role

        const userExist = await findUserByEmail(email)
        if(userExist){
            return res.status(401).json({error: "Email already exist."})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await createNewUser(name, email, role, hashedPassword) 
        delete (user as any).password
        delete (user as any).orders
        delete (user as any).currencies
        delete (user as any).currencyUpdates

        res.send(user)

        const link = "http://localhost:5000/rmbdeals/passwordreset?id=${}"

        const { to, subject, text } = {
            to: email,
            subject: "Password Reset",
            text: `
                Please reset your password to access your account using the link below.
                Link expires in 30 minutes.

                ${link}
            `
        }

        // const mailOptions = {
        //     from: process.env.EMAIL_SENDER,
        //     to,
        //     subject,
        //     text,
        // };

        // await transporter.sendMail(mailOptions);
    }catch(err:any){
        res.status(400).json(err)
    }
}
