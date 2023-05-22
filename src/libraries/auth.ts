import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import { database } from "./database";
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import { fetchRedis } from "@/helpers/redis";


// tot je funkce ktera nam kontorluje spravne prihlaseni pomoci google account, a v pripade chybejicich credentials throwneme adekvatni error
const getGoogleCredentials = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || clientId.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_ID')
    }
    if (!clientSecret || clientSecret.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_SECRET')
    }
    return {
        clientId,
        clientSecret
    }
}


export const authOptions: NextAuthOptions = {
    // toto je od @next-auth/upstash-redis-adapter a v podstate to za nas vezme vsechny data o tom useru co se prave prihlasil a posle to za nas do databaze
    adapter: UpstashRedisAdapter(database),
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login'
    },
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
        }),
    ],

    // callback are actions that are taken when certain events happen
    callbacks: {
        async jwt({ token, user }) {
            //FIRST OPTION
            // const dbUser = (await database.get(`user:${token.id}`)) as User | null

            // if (!dbUser) {
            //     token.id = user!.id
            //     return token
            // }

            // SECOND OPTION
            const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as string | null

            if (!dbUserResult) {
                token.id = user!.id
                return token
            }

            const dbUser = JSON.parse(dbUserResult) as User


            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image
            }
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }
            return session
        },
        redirect() {
            return '/dashboard'
        }

    }
}

