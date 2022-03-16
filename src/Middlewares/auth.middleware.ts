import {MiddlewareFn} from 'type-graphql'
import {verify} from 'jsonwebtoken'
import {Response,Request} from 'express'
import {enviroment} from '../config/enviroment'



export interface Icontext{
    req: Request,
    res: Response,
    payload: {userId: string};
}

export const IsAuth: MiddlewareFn <Icontext> = ({context}, next) => {
    
    try {
const bearerToken = context.req.headers.authorization;

if (!bearerToken) {
  throw new Error("Unauthorized");
}
      
const jwt = bearerToken.split(" ")[1];

const payload = verify (`${jwt}`, enviroment.JWT_SECRET);
context.payload = payload as any;


    } catch (e) {
        throw new Error(`${e}`)
    }

    return next();
}