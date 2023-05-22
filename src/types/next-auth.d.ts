import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'


// tohle je neco co se potrebuje k next-auth aby to authentikovalo usera


type UserId = string


declare module 'next-auth/jwt' {
    interface JWT {
        id: UserId
    }
}


declare module 'next-auth' {
    interface Session {
        user: User & {
            id: UserId
        }
    }
}


