'use client'

import { pusherClient } from '@/libraries/pusher'
import { toPusherKey } from '@/libraries/utilities'
import { UserIcon } from 'lucide-react'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

interface FriendRequestsSidebarOptionProps {
    sessionId: string
    initialUnseenRequestCount: number
}

const FriendRequestsSidebarOption: FC<FriendRequestsSidebarOptionProps> = ({ sessionId, initialUnseenRequestCount }) => {

    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(initialUnseenRequestCount)

    // --------------------
    // listening to realtime events - 6h26m
    useEffect(() => {
        // here we are telling pusher to listen and listen for anything that heppanes in the incoming friend requests 'file'
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))  // the only thing with pusher is that it doesnt allow : semicolons so we created a helper function in the utilities  called toPusherKey

        // we also want to subscribe to friends
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        // now you have to say what needs to happen when there is a change in the icoming friend requests
        const friendRequestHandler = () => {
            // we just want to add + 1 request to hsow in the icon in real time
            setUnseenRequestCount((prev) => prev + 1)
        }

        const addedFriendHandler = () => {
            // we just want to substract 1 request from the icon in real time
            setUnseenRequestCount((prev) => prev - 1)
        }

        // here you are saying that whenever something happens on the incoming_friend_requests, trigger a function friendRequestHandler
        pusherClient.bind('incoming_friend_requests', friendRequestHandler)
        pusherClient.bind('new_friend', addedFriendHandler)

        // you have to clean up after yourself and if you subscribe to something you also have to unsubscribe and same for the bind - you have to unbind 
        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
            pusherClient.unbind('new_friend', addedFriendHandler)
        }
    }, [sessionId])


    return <Link href='/dashboard/requests' className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold dark:text-zinc-300 dark:hover:border-slate-800 dark:hover:bg-slate-800'>
        <div className='text-gray-400 border-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white    
         dark:bg-slate-900 dark:hover:border-zinc-300 dark:group-hover:border-zinc-300 dark:group-hover:text-zinc-300'>
            {/* here we display lucide icon */}
            <UserIcon className='h-4 w-4' />
        </div>
        {/* class truncate means if the page goes too small the text will be cut of with ... rather than pushing it to a next line */}
        <p className='truncate'>Friend Requests</p>

        {unseenRequestCount > 0 ? (
            <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600 dark:bg-indigo-300 dark:text-indigo-600'>
                {unseenRequestCount}
            </div>
        ) : null}
    </Link>
}

export default FriendRequestsSidebarOption