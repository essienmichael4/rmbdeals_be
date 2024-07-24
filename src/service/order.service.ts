import { PrismaClient, Status } from '@prisma/client'
import log from '../utils/logger'
const prisma = new PrismaClient()

export const createOrderForUnknownUser = (account:string, amount:number, rate:number, recipient:string, currency:string, qrcode:string) => {

    const rmbEquivalence = amount * rate

    return prisma.order.create({
        data:{
            account,
            amount,
            recipient,
            rmbEquivalence: rmbEquivalence,
            rate: 0.444,
            product: process.env.PRODUCT as string,
            currency,
            qrCode: qrcode,
            status: Status.HELD,
            userId: 2
        }
    })
}

export const createOrderForUser = (account:string, amount:number, rate:number, recipient:string, currency:string, qrcode:string, userId:number) => {

    const rmbEquivalence = amount * rate

    return prisma.order.create({
        data:{
            account,
            amount,
            recipient,
            rmbEquivalence: rmbEquivalence,
            rate: 0.444,
            product: process.env.PRODUCT as string,
            currency,
            qrCode: qrcode,
            status: Status.HELD,
            userId
        }
    })
}

export const fetchUserOrder = (id:number, userId?:number)=>{
    return prisma.order.findUnique({where:{
        id,
        userId
    }})
}

export const addOrderBilling = (id:number, name:string, email:string, whatsapp:string, momoNumber:string, notes?:string, userId?:number) =>{
    log.info({id, userId})
    
    return prisma.order.update({where: {
        id,
        userId
    }, data: {
        orderBilling: {
            create: {
                name,
                whatsapp,
                momoNumber,
                email,
                notes: notes as string
            }
        }
    }})
}

export const addOrderBillingNonUser = (id:number, name:string, email:string, whatsapp:string, momoNumber:string, notes?:string, userId?:number) =>{
    log.info({id, userId})
    
    return prisma.order.update({where: {
        id,
    }, data: {
        userId,
        orderBilling: {
            create: {
                name,
                whatsapp,
                momoNumber,
                email,
                notes: notes as string
            }
        }
    }})
}

export const checkoutLoginOrderUpdate = (id:number, userId:number) => {
    return prisma.order.update({where: {
        id
    },data : {
        userId
    }})
}
