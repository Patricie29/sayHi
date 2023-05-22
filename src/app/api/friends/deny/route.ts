import { authOptions } from "@/libraries/auth"
import { database } from "@/libraries/database"
import { getServerSession } from "next-auth"
import { z } from "zod"



export async function POST(req: Request) {
    try {
        // this is how you get access to the body content of the POST request
        const body = await req.json()

        // first you need to check who is sending the request
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        const { id: idToDeny } = z.object({ id: z.string() }).parse(body) //if successfull you will get id as a string

        await database.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny)

        return new Response('OK')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload.', { status: 422 })
        }

        return new Response('Invalid request.', { status: 400 })

    }
}