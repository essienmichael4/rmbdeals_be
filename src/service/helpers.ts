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