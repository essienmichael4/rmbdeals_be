import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { AuthRequest } from "../types/authRequest.type";

declare module "jsonwebtoken" {
    export interface JwtPayload {
        username: string,
        dub: {
            id: number,
            name: string
        }
    }
}


export async function authenticateRefreshToken(req:AuthRequest, res:Response, next:NextFunction) {
    try{
        const token = extractTokenFromHeader(req)
        if(!token) return res.sendStatus(401).json({message: "Unauthorized"})   

        const payload = <jwt.JwtPayload>jwt.verify(token, process.env.JWT_SECRET_KEY as string)
        
        req.tokenAccount = payload
        next()
    }catch(e){
        return res.sendStatus(401).json({message: "Unauthorized"})
    }
}

function extractTokenFromHeader(request:Request){        
    const [type, token] = request?.headers?.authorization?.split(" ") ?? []
    return type == "Refresh" ? token : undefined
    
}
