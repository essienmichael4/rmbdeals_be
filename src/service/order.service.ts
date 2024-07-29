import { PrismaClient, Status } from '@prisma/client'
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
            userId: 1
        }
    })
}

export const createOrderForUser = (account:string, amount:number, rate:number, recipient:string, currency:string, qrcode:string, userId:number) => {

    const rmbEquivalence = amount * rate

    return prisma.$transaction([
        prisma.order.create({
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
        }),

        prisma.monthHistory.upsert({
            where:{
                day_month_year_userId:{
                    day: new Date().getUTCDate(),
                    month: new Date().getUTCMonth(),
                    year: new Date().getUTCFullYear(),
                    userId
                }
            },
            create:{
                day: new Date().getUTCDate(),
                month: new Date().getUTCMonth(),
                year: new Date().getUTCFullYear(),
                orders: 1,
                expense: amount,
                userId
            },
            update: {
                orders: {increment: 1},
                expense: {increment: amount}
            }
        }),
        prisma.yearHistory.upsert({
            where:{
                month_year_userId:{
                    month: new Date().getUTCMonth(),
                    year: new Date().getUTCFullYear(),
                    userId
                }
            },
            create:{
                month: new Date().getUTCMonth(),
                year: new Date().getUTCFullYear(),
                orders: 1,
                expense: amount,
                userId
            },
            update: {
                orders: {increment: 1},
                expense: {increment: amount}
            }
        })
    ])
    // return prisma.order.create({
    //     data:{
    //         account,
    //         amount,
    //         recipient,
    //         rmbEquivalence: rmbEquivalence,
    //         rate: 0.444,
    //         product: process.env.PRODUCT as string,
    //         currency,
    //         qrCode: qrcode,
    //         status: Status.HELD,
    //         userId
    //     }
    // })
}

export const fetchUserOrderforCheckout = (id:number, userId?:number)=>{
    return prisma.order.findUnique({where:{
        id,
        userId
    }})
}

export const addOrderBilling = (id:number, name:string, email:string, whatsapp:string, momoNumber:string, notes?:string, userId?:number) =>{
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

export const addOrderBillingNonUser = (id:number, name:string, email:string, whatsapp:string, momoNumber:string, userId:number, amount:number, notes?:string) =>{
    return prisma.$transaction([
        prisma.order.update({
            where: {
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
            }
        }),

        prisma.monthHistory.upsert({
            where:{
                day_month_year_userId:{
                    day: new Date().getUTCDate(),
                    month: new Date().getUTCMonth(),
                    year: new Date().getUTCFullYear(),
                    userId
                }
            },
            create:{
                day: new Date().getUTCDate(),
                month: new Date().getUTCMonth(),
                year: new Date().getUTCFullYear(),
                orders: 1,
                expense: amount,
                userId
            },
            update: {
                orders: {increment: 1},
                expense: {increment: amount}
            }
        }),

        prisma.yearHistory.upsert({
            where:{
                month_year_userId:{
                    month: new Date().getUTCMonth(),
                    year: new Date().getUTCFullYear(),
                    userId
                }
            },
            create:{
                month: new Date().getUTCMonth(),
                year: new Date().getUTCFullYear(),
                orders: 1,
                expense: amount,
                userId
            },
            update: {
                orders: {increment: 1},
                expense: {increment: amount}
            }
        })
    ])

}

export const checkoutLoginOrderUpdate = (id:number, userId:number, amount:number) => {
    return prisma.$transaction([
        prisma.order.update({where: {
            id
        },data : {
            userId
        }}),

        prisma.monthHistory.upsert({
            where:{
                day_month_year_userId:{
                    day: new Date().getUTCDate(),
                    month: new Date().getUTCMonth(),
                    year: new Date().getUTCFullYear(),
                    userId
                }
            },
            create:{
                day: new Date().getUTCDate(),
                month: new Date().getUTCMonth(),
                year: new Date().getUTCFullYear(),
                orders: 1,
                expense: amount,
                userId
            },
            update: {
                orders: {increment: 1},
                expense: {increment: amount}
            }
        }),

        prisma.yearHistory.upsert({
            where:{
                month_year_userId:{
                    month: new Date().getUTCMonth(),
                    year: new Date().getUTCFullYear(),
                    userId
                }
            },
            create:{
                month: new Date().getUTCMonth(),
                year: new Date().getUTCFullYear(),
                orders: 1,
                expense: amount,
                userId
            },
            update: {
                orders: {increment: 1},
                expense: {increment: amount}
            }
        })
    ])
}

export const fetchUserOrder = (id:number, userId:number) => {
    return prisma.order.findUnique({
        where: {
            id, userId
        }
    })
}

export const fetchUserOrders = ( userId:number) => {
    return prisma.order.findMany({
        where: {
            userId
        },include:{
            orderBilling: true
        }
    })
}

export const fetchUserRecentOrders = ( userId:number) => {
    return prisma.order.findMany({
        where: {
            userId
        },include:{
            orderBilling: true
        },
        orderBy:{
            id: "desc"
        },
        take: 20
    })
}


