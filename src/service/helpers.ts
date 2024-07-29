import * as jwt from 'jsonwebtoken'

export const generateJWT = (email:string, id:number, name:string, time: string) => {
    const payload = {
        username: email,
        dub: {
            id,
            name
        }
    }

    return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {expiresIn: time})
}

export function DateToUTCDate(date:Date){
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        )
    )
}
