import { PrismaClient, Role } from '@prisma/client'
const prisma = new PrismaClient()

export const createNewUser = (name:string, email:string, role: Role, password:string,)=>{
    return prisma.user.create({data: {
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
