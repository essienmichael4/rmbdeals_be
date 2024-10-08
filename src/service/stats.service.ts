import { PrismaClient } from '@prisma/client'
import { getDaysInMonth } from 'date-fns'
import { DateToUTCDate } from './helpers'
const prisma = new PrismaClient()

type HistoryData = {
    expense:number,
    orders: number,
    year: number,
    month: number,
    day?: number
}

export const totalOrders = async (from?:Date, to?: Date, userId?:number)=>{
    return prisma.order.count({
        where: {
            userId,
            createdAt:{
                lte: to && DateToUTCDate(new Date(to)),
                gte: from && DateToUTCDate(new Date(from))
            },
        },
    })
}

export const successfulOrders = async (from?:Date, to?: Date, userId?:number) => {
    return prisma.order.count({
        where: {
            userId,
            status: "COMPLETED",
            createdAt:{
                lte: to && DateToUTCDate(new Date(to)),
                gte: from && DateToUTCDate(new Date(from))
            },
        },
    })
}

export const heldOrders = (from?:Date, to?: Date, userId?:number)=>{
    return prisma.order.count({
        where: {
            userId,
            status: {
                in: ["CANCELLED", "HELD", "PENDING"]
            },
            createdAt:{
                lte: to && DateToUTCDate(new Date(to)),
                gte: from && DateToUTCDate(new Date(from))
            },
        },
    })
}

export const heldOrdersAdmin = (from?:Date, to?: Date, userId?:number)=>{
    return prisma.order.count({
        where: {
            userId,
            status: {
                in: ["HELD", "PENDING"]
            },
            createdAt:{
                lte: to && DateToUTCDate(new Date(to)),
                gte: from && DateToUTCDate(new Date(from))
            },
        },
    })
}

export const cancelledOrdersAdmin = (from?:Date, to?: Date, userId?:number)=>{
    return prisma.order.count({
        where: {
            userId,
            status: "CANCELLED",
            createdAt:{
                lte: to && DateToUTCDate(new Date(to)),
                gte: from && DateToUTCDate(new Date(from))
            },
        },
    })
}

export const projectedExpense = (from?:Date, to?: Date, userId?:number)=>{
    return prisma.order.aggregate({
        where: {
            userId,
            createdAt:{
                lte: to && DateToUTCDate(new Date(to)),
                gte: from && DateToUTCDate(new Date(from))
            },
        },
        _sum: {amount:true}
    })
}

export const successfulExpense = (from?:Date, to?: Date, userId?:number)=>{
    return prisma.order.aggregate({
        where: {
            userId,
            status: "COMPLETED",
            createdAt:{
                lte: to && DateToUTCDate(new Date(to)),
                gte: from && DateToUTCDate(new Date(from))
            },
        },
        _sum: {amount:true}
    })
}

export const heldExpense = (from?:Date, to?: Date, userId?:number)=>{
    return prisma.order.aggregate({
        where: {
            userId,
            status: "CANCELLED" || "HELD" || "PENDING",
            createdAt:{
                lte: to && DateToUTCDate(new Date(to)),
                gte: from && DateToUTCDate(new Date(from))
            },
        },
        _sum: {amount:true}
    })
}

export const getUserStatistics = async ( from?:Date, to?: Date, userId?:number) => {
    const totalOrder = await totalOrders(from, to, userId) 
    const successfulOrder = await successfulOrders(from, to, userId) 
    const heldOrder = await heldOrdersAdmin(from, to, userId) 
    const cancelledOrder = await cancelledOrdersAdmin(from, to, userId) 
    const projectedEx = await projectedExpense(from, to, userId) 
    const successfulEx = await successfulExpense(from, to, userId) 
    const heldEx = await heldExpense(from, to, userId) 

    return {
        totalOrders:totalOrder,
        successfulOrders: successfulOrder,
        heldOrders: heldOrder,
        cancelledOrders: cancelledOrder,
        projectedExpense: projectedEx,
        successfulExpense: successfulEx,
        heldExpense: heldEx
    }
}

export const getHistoryData = async(timeframe: "MONTH" | "YEAR", month:number, year:number, userId?:number) => {
    if(timeframe === "YEAR"){
        return await getYearHistory(year, userId)
    }
    if(timeframe === "MONTH"){
        return await getMonthHistory(month, year, userId)
    }
}

// export const getAllHistoryData = async(timeframe: "MONTH" | "YEAR", month:number, year:number) => {
//     if(timeframe === "YEAR"){
//         return await getAllYearHistory(year)
//     }
//     if(timeframe === "MONTH"){
//         return await getAllMonthHistory(month, year)
//     }
// }

export const getMonthHistory = async (month:number, year:number, userId?:number) => {
    const result = await prisma.monthHistory.groupBy({
        by:["day"],
        where:{
            month,
            year,
            userId
        },
        _sum:{
            orders:true,
            expense: true
        },
        orderBy:{day:"asc"}
    })

    if(!result || result.length === 0) return []

    const history:HistoryData[] = []
    const daysInMonth = getDaysInMonth(new Date(year, month))

    for(let i = 1; i <= daysInMonth; i++){
        let orders = 0
        let expense = 0

        const day = result.find(row => row.day === i)
        if(day){
            orders = day._sum.orders || 0
            expense = day._sum.expense || 0
        }

        history.push({
            year,
            month,
            orders,
            expense,
            day: i
        })
    }

    return history
}

export const getYearHistory = async(year:number, userId?:number) => {
    const result = await prisma.yearHistory.groupBy({
        by: ["month"],
        where:{
            year,userId
        },
        _sum: {
            orders: true,
            expense:true
        },
        orderBy:{
            month: "asc"
        }
    })

    if(!result || result.length == 0) return []

    const history:HistoryData[] = []

    for(let i=0; i < 12; i++){
        let orders = 0
        let expense = 0

        const month = result.find(row => row.month === i)
        if(month){
            orders = month._sum.orders || 0
            expense = month._sum.expense || 0
        }

        history.push({
            year,
            month: i,
            orders,
            expense
        })
    }

    return history
}

// export const getAllMonthHistory = async (month:number, year:number) => {
//     const result = await prisma.monthHistory.groupBy({
//         by:["day"],
//         where:{
//             month,
//             year,
//         },
//         _sum:{
//             orders:true,
//             expense: true
//         },
//         orderBy:{day:"asc"}
//     })

//     if(!result || result.length === 0) return []

//     const history:HistoryData[] = []
//     const daysInMonth = getDaysInMonth(new Date(year, month))

//     for(let i = 1; i <= daysInMonth; i++){
//         let orders = 0
//         let expense = 0

//         const day = result.find(row => row.day === i)
//         if(day){
//             orders = day._sum.orders || 0
//             expense = day._sum.expense || 0
//         }

//         history.push({
//             year,
//             month,
//             orders,
//             expense,
//             day: i
//         })
//     }

//     return history
// }

// export const getAllYearHistory = async(year:number) => {
//     const result = await prisma.yearHistory.groupBy({
//         by: ["month"],
//         where:{
//             year,
//         },
//         _sum: {
//             orders: true,
//             expense:true
//         },
//         orderBy:{
//             month: "asc"
//         }
//     })

//     if(!result || result.length == 0) return []

//     const history:HistoryData[] = []

//     for(let i=0; i < 12; i++){
//         let orders = 0
//         let expense = 0

//         const month = result.find(row => row.month === i)
//         if(month){
//             orders = month._sum.orders || 0
//             expense = month._sum.expense || 0
//         }

//         history.push({
//             year,
//             month: i,
//             orders,
//             expense
//         })
//     }

//     return history
// }

export const getPeriods= async () => {
    const result = await prisma.monthHistory.findMany({
        select:{
            year:true
        },
        distinct: ["year"],
        orderBy: {
            year: "asc"
        }
    })

    const years = result.map(el => el.year )
    if(years.length === 0){
        return [new Date().getFullYear()]
    }

    return years
}
