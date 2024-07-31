import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { AuthRequest } from "../types/authRequest.type";
import { findUserById } from "../Service/user.service";

declare module "jsonwebtoken" {
    export interface JwtPayload {
        username: string,
        dub: {
            id: number,
            name: string
        }
    }
}


export async function authenticateAdminToken(req:AuthRequest, res:Response, next:NextFunction) {
    try{
        const token = extractTokenFromHeader(req)
        if(!token) return res.sendStatus(401).json({message: "Unauthorized"})   

        const payload = <jwt.JwtPayload>jwt.verify(token, process.env.JWT_SECRET_KEY as string)
        
        const user = await findUserById(payload.dub.id)
        if(!user){
            return res.status(401).json({error: "Api token invalid, Please login and try again"})
        }

        if(user.role !== "ADMIN"){
            return res.status(401).json({error: "You are not authorized to make this request"})
        }

        req.tokenAccount = payload
        next()
    }catch(e){
        return res.sendStatus(403).json({message: "Unauthorized"})
    }
}

function extractTokenFromHeader(request:Request){        
    const [type, token] = request?.headers?.authorization?.split(" ") ?? []
    return type == "Bearer" ? token : undefined
}
