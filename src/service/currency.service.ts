import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getCurrency = (currency:string) => {
    return prisma.currency.findUnique({where: {currency}})
}
