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

export const createCurrency = (userId:number, label:string, currency:string, rate:number, description:string) => {
    return prisma.currency.create({
        data: {
            label,
            currency,
            rate,
            description,
            user: {
                connect: {
                    id: userId
                }
            }
        }
    })
}

export const updateExistingCurrency = (userId:number, previousRate:number, currency:string, label?:string,  rate?:number, description?:string) => {
    return prisma.currency.update({
        where: {
            currency
        },
        data: {
            label,
            rate,
            description,
            currencyUpdates:  {
                create: {
                    currentRate: rate ? rate : previousRate,
                    previousRate,
                    updatedBy: userId
                }
            }
        }
    })
}
