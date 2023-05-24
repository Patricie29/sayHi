import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/libraries/auth"
import { database } from "@/libraries/database"
import { pusherServer } from "@/libraries/pusher"
import { toPusherKey } from "@/libraries/utilities"
import { Message, messageValidator } from "@/libraries/validations/message"
import { nanoid } from "nanoid"
import { getServerSession } from "next-auth"




export async function POST(req: Request) {

    try {
        // first we desctructure whatever we are sending in the request - we are sending this: { text: input, chatId }
        // : {text: string, chatId: string}  it typescript validation
        const { text, chatId }: { text: string, chatId: string } = await req.json()

        // now we need to find out if the user is logged in - if he evne is allowed to send a message
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Anauthorized', { status: 401 })
        }

        //since we know the two ids in the url are seperated by -- we can call split and split them at that point
        const [userId1, userId2] = chatId.split('--')

        // if the logged user's id doesnt match any of the id for the chat, he is not allowed to see it - you have to be owner of the chat to be able to see it
        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response('Anauthorized', { status: 401 })
        }


        const friendId = session.user.id === userId1 ? userId2 : userId1

        //now we check if the id is in the person's friends list, if not he shouldnt be able to send a message 
        const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[]
        const isFriend = friendList.includes(friendId)

        //if you are not friend you shouldnt be able to exhcange messages
        if (!isFriend) {
            return new Response('Anauthorized', { status: 401 })
        }

        // if you get to this line everything is valid and you are able to send a message

        // now we get the details of the person sending the message
        const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string
        const sender = JSON.parse(rawSender) as User

        //you get the timestamp, cause we wanna know when the message was sent
        const timestamp = Date.now()

        // so this is the message data, we connect it with our Message type
        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp
        }

        // now it has to pass our validation using zod
        const message = messageValidator.parse(messageData)

        //-----------------------------
        // implementing real time functionality with pusher
        // here we notify all connected clients to the chat room 
        pusherServer.trigger(toPusherKey(`chat:${chatId}`),
            'incoming-message', //again this needs to match with the client side name of a function 
            message //this is what is recieved as prop in the  Messages components in a function messageHandler 
        )

        // showing notification when this user recieves any message from any chat
        pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message,
            senderImg: sender.image,
            senderName: sender.name
        })


        // zadd means add to a sorted list 
        await database.zadd(`chat:${chatId}:messages`, { score: timestamp, member: JSON.stringify(message) })


        return new Response('OK')

    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }
        return new Response('Internal server error', { status: 500 })
    }
}