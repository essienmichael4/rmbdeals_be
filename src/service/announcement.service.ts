import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getAnnouncement = () => {
    return prisma.announcement.findFirst()
}

export const createAnnouncement = (userId:number, subject:string, title?:string)=>{
    return prisma.announcement.create({
        data: {
            title,
            subject,
            updatedBy: userId,
            show: "FALSE"
        }
    })
}

export const updateExistingAnnouncement = (userId:number, subject:string, title?:string)=>{
    return prisma.announcement.update({
        data: {
            title,
            subject,
            updatedBy: userId
        },
        where: {
            id: 1
        }
    })
}
