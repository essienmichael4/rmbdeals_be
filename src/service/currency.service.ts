import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getCurrency = (currency:string) => {
    return prisma.currency.findUnique({where: {currency}})
}

export const getCurrencyForUser = (currency:string) => {
    return prisma.currency.findUnique({where: {currency}})
}

export const getSingleCurrency = () => {
    return prisma.currency.findFirst()
}

export const getAllCurrencies = () => {
    return prisma.currency.findMany()
}
