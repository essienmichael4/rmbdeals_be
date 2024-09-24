import { PrismaClient, Show } from '@prisma/client'
const prisma = new PrismaClient()

export const getAccount = () => {
    return prisma.account.findFirst()
}

export const createAccount = (userId:number, name:string, number:string)=>{
    return prisma.account.create({
        data: {
            number,
            name,
            updatedBy: userId,
        }
    })
}

export const updateExistingAccount = (userId:number, name:string, number:string)=>{
    return prisma.account.update({
        data: {
            name,
            number,
            updatedBy: userId
        },
        where: {
            id: 1
        }
    })
}
