import { PrismaClient, Role } from '@prisma/client'
const prisma = new PrismaClient()

export const createNewUser = (name:string, email:string, role: Role, password:string,)=>{
    return prisma.user.create({
        data: {
            name,
            email,
            role,
            password
        }
    })
}

export const findUserById = (id:number)=>{
    return prisma.user.findUnique({where:{id}})
}

export const findUserByEmail = (email:string)=>{
    return prisma.user.findUnique({where:{email}})
}

export const updateUserAccountInfo = (id:number, name?:string, email?:string) => {
    return prisma.user.update({
        where: {id},
        data: {
            name,
            email
        }
    })
}

export const updatePassword = (id:number, hashedPassword:string) => {
    return prisma.user.update({
        where: {id},
        data: {
            password: hashedPassword
        }
    })
}
