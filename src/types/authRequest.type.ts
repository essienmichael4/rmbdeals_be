// import { User } from "@prisma/client";
import { Request} from "express";

export type AuthRequest = Request & {tokenAccount?: {
    username: string,
    dub: {
        id: number,
        name: string
    }
}}