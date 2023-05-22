// this is the path to this file: api/friends/add 
//route.ts is mandatory name 

// YOUTUBE 1h50min

import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/libraries/auth"
import { database } from "@/libraries/database"
import { pusherServer } from "@/libraries/pusher"
import { toPusherKey } from "@/libraries/utilities"
import { addFriendValidator } from "@/libraries/validations/add-friend"
import { getServerSession } from "next-auth"
import { z } from "zod"


// you can choose what request you wanna handle (POST, GET, PUT, DELETE... )
// req: Request is already in React, same as if you would be using Error
export async function POST(req: Request) {
    try {
        // this is how you get access to the body content of the POST request
        const body = await req.json()

        // now you can destructure the email from the body and name it as you want, like emailToAdd and you should revalidate AGAIN using addFriendValidator, incase the client managed to put something that is not a valid email address  - never trust CLIENT INPUT
        const { email: emailToAdd } = addFriendValidator.parse(body.email)


        // now we need to reach out to our database and get back the user id. This is the url under which their email address is stored and that's how we can get their id
        // this is the email of the user that we want to add and we want to figure out their id 
        const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`, {
            // upstash needs to know you are authorized to get these information and enter the database , and for that we have the token
            // headers are like special information that you are sending the server along with your request, in this case we are telling the server we have the token and we are authorized to access information from our database
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            },
            // we never want to store the data and we always want to deliver fresh data, so we need to be specific with next js
            cache: 'no-store'
        })

        // result string | null, protoze kdyz si das console.log(data) tak to je format ve kterym ty vlastne dostanes to userID - bud dostanes to id coz bude string a nebo null pokud tam zadne id neni 
        const data = await RESTResponse.json() as { result: string | null }

        const idToAdd = data.result

        // // you can use this line because you have it set up in fetchRedis helper
        // const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string

        // if the id doesnt exist, then you can show message that the user doest not exist
        if (!idToAdd) {
            return new Response('This person does not exist!', { status: 400 })
        }

        // now we need to find out who is making the request from the server side, not the client side
        const session = await getServerSession(authOptions)

        // if there is no session, means you're not allowed to do this and you would need to login
        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        //now  we need to chcek just in case, if the id is equal to the id of the user that is currently logged in - it wouldn't make sense to add yourself a friend request
        if (idToAdd === session.user.id) {
            return new Response('You cannot add yourself as a friend!', { status: 400 })
        }

        // now we can check if the user is already added - so you cannot add a friend that has already been added
        // `user:${idToAdd}:incoming_friend_requests`  this is the structure what you find in your database - this is how it looks in Upstash and this is where we will store all friends requests, so this is how you can check if it already exists in this 'folder of friends requests'
        // session.user.id is how you get the current logged in user
        const userIsAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id) as 0 | 1
        // as 0 | 1 znamena ze either the user IS a member of the 'folder of friends requests' or NOT 

        if (userIsAlreadyAdded) {
            return new Response('Already added this user.', { status: 400 })
        }

        //now we check so you cannot send a friend request to someone that already is in your friends list 
        //`user:${session.user.id}:friends`, idToAdd) with this you are checking a friends list of the user that is currently logged in and checking if they are friends
        // you can have it the other way around as well, becasu if someone has a user as a friend it will work the other way around, so doesnt matter who you check, if the already logged in user or the one that is in the friends list -('sismember', `user:${idToAdd}:friends`, session.user.id}) = this works as well
        const userIsAlreadyFriend = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd) as 0 | 1
        // as 0 | 1 znamena ze either the user IS a member of the 'folder of friends' or NOT 

        if (userIsAlreadyFriend) {
            return new Response('You are friends already!', { status: 400 })
        }


        // YOUTUBE 2h 12minutes
        // SO AFTER YOU MEET ALL THE VALIDATIONS, we can finally send a friend request 

        // ------------------------------
        // Before adding it to the database we want to use realtime functionality and you need to notify the user
        pusherServer.trigger(
            // this has to be same as when you use it on the client side - you have to listen to the same thing, and you want to notify the person you are sending the friends request to 
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            // again, same as on the client side this is the name of the cuntion we are listening to
            'incoming_friend_requests',
            // here is the information you are sending - from who you are getting the friends request from
            {
                senderId: session.user.id,
                senderEmail: session.user.email
            }
        )
        // ------------------------------

        //sadd means add to database
        database.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')


    } catch (error) {

        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload.', { status: 422 })
        }

        return new Response('Invalid request.', { status: 400 })

    }
}
