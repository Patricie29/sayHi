
// YOUTUBE 4h8min
// path: /dashboard/chat

import ChatInput from '@/components/ChatInput'
import Messages from '@/components/Messages'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/libraries/auth'
import { database } from '@/libraries/database'
import { messageArrayValidator } from '@/libraries/validations/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        chatId: string   //chatId must match your dynamic name of the file [chatId]
        //{params.chatId} would be how you access the id in the url
    }
}

// this will be a function that  fetches all messages
const getChatMessages = async (chatId: string) => {
    try {
        // so the result that we expect will be of type string array (it will be array of messages)
        // zrange is sorted list array 
        // second argument is what we want to fetch - we want the certain messages of two people that you find under that specific path
        // third argument is that we want to start fetching from the index of 0 - meaning from the first message - till the end index of -1 - meaning everything, we are never stoping to fetch
        const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)

        // now you need to map through the messages and you need to parse it - be aware these messages are in order, meaning the newest one is on the top
        const dbmessages = results.map((oneMessage) => {
            return JSON.parse(oneMessage) as Message  // Message is our type, same as User
        })

        // for CSS styling you want the newest messages to be at the bottom and the oldest at the top hence we need to reverse the order
        const reversedDbMessages = dbmessages.reverse()  //reverse is a method that will reverse the order of the array

        // now we need to validated the messages to make sure they are in the right format using message array validator from zod
        const messages = messageArrayValidator.parse(reversedDbMessages)

        return messages


    } catch (error) {
        notFound()
    }
}

const page = async ({ params }: PageProps) => {

    const { chatId } = params //for getting the id out of url
    const session = await getServerSession(authOptions)

    if (!session) notFound()

    // now we can destructure the user from the session
    const { user } = session

    //now we need access to the chat ID and the format will be: /dashboard/chat/userId1--userId2  - and it will be like this for both users without knowing which id is the one  currently logged in person so we can make sure it is the same chat for both people
    const [userId1, userId2] = chatId.split('--')

    // now the user should be able to view this chat ONLY if one of the ids is actually theirs
    if (user.id !== userId1 && user.id !== userId2) {
        notFound()
    }

    //this is how we check who has what id. so if the currently logged in user has same id as userId1 it's the friend's id
    const chatPartnerId = user.id === userId1 ? userId2 : userId1

    //now we need to get their email and name
    // const chatPartner = (await database.get(`user:${chatPartnerId}`)) as User
    const chatPartnerRaw = await fetchRedis('get', `user:${chatPartnerId}`) as string
    const chatPartner = JSON.parse(chatPartnerRaw) as User

    const initialMessages = await getChatMessages(chatId)



    return <div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]'>
        <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200 dark:border-slate-700'>
            <div className='relative flex items-center space-x-4'>
                <div className='relative'>

                    <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
                        <Image fill referrerPolicy='no-referrer' src={chatPartner.image} alt={`${chatPartner.name} profile picture`} className='rounded-full' />
                    </div>

                </div>
                <div className='flex flex-col leading-tight'>

                    <div className='ext-xl flex items-center'>
                        <span className='text-gray-700 mr-3 font-semibold dark:text-zinc-300'>{chatPartner.name}</span>
                    </div>
                    <span className='text-sm text-gray-600 dark:text-zinc-400'>{chatPartner.email}</span>

                </div>
            </div>
        </div>
        <Messages initialMessages={initialMessages} sessionId={session.user.id} chatPartner={chatPartner} sessionImg={session.user.image} chatId={chatId} />
        <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
}

export default page