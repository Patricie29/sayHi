'use client'


// YOUTUBE 3h15min

import { FC, useEffect, useState } from 'react'
import { Icons } from './Icons'
import { Check, UserPlus } from 'lucide-react'
import { X } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { pusherClient } from '@/libraries/pusher'
import { toPusherKey } from '@/libraries/utilities'

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({ sessionId, incomingFriendRequests }) => {

    const router = useRouter() //for refreshing page
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests) // this will be array

    // ---------------------------------------
    // ADDING REAL TIME FUNCTIONALITY USING PUSHER - 6h
    useEffect(() => {
        // here we are telling pusher to listen and listen for anything that happens in the incoming friend requests 'file'
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))  // the only thing with pusher is that it doesnt allow : semicolons so we created a helper function in the utilities  called toPusherKey


        // now you have to say what needs to happen when there is a change in the icoming friend requests
        const friendRequestHandler = ({ senderId, senderEmail }: IncomingFriendRequest) => {
            // to whateever requests there were previously you need to add the ones that are currently being sent
            setFriendRequests((prev) => [...prev, { senderEmail, senderId }])
        }

        // here you are saying that whenever something happens on the incoming_friend_requests, trigger a function friendRequestHandler
        pusherClient.bind('incoming_friend_requests', friendRequestHandler)

        // you have to clean up after yourself and if you subscribe to something you also have to unsubscribe and same for the bind - you have to unbind 
        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)

        }
    }, [sessionId])
    // ---------------------------------------

    // ---------------------------------------
    // function for accepting a friend request
    const acceptFriendRequest = async (senderId: string) => {
        // this is where we send the request - it has to match with your folders names!
        await axios.post('/api/friends/accept', { id: senderId })

        // now we have to update how many friendsrequest we see - since we accepted one we have to change the number obviously and remove the one we accepted.
        // setFriendRequests is the state where we hold the number of friends requests
        setFriendRequests((prev) =>
            prev.filter((oneRequest) => oneRequest.senderId !== senderId)
        )
        // then we want to refresh the page using router from useRouter (from next/navigation)
        router.refresh()
    }
    // ---------------------------------------

    // ---------------------------------------
    // function for denying a friend request - same as accepting because no matter if we accept or deny we want the person to be taken out of the friends requests
    const denyFriendRequest = async (senderId: string) => {
        // this is where we send the request
        await axios.post('/api/friends/deny', { id: senderId })

        // now we have to update how many friendsrequest we see - since we accepted one we have to change the number obviously and remove the one we accepted.
        // setFriendRequests is the state where we hold the number of friends requests
        // passing a parameter, in our case 'prev' in the state in the function represents the previous state - it knows it needs to look on previous state (you can name it whatever)
        setFriendRequests((prev) =>
            prev.filter((oneRequest) => oneRequest.senderId !== senderId)
        )
        // then we want to refresh the page using router from useRouter (from next/navigation)
        router.refresh()
    }
    // ---------------------------------------


    return <>
        {/* if there are no friends requests */}
        {friendRequests.length === 0 ? (
            <p className='text-sm text-zinc-500'>Nothing to show here...</p>
        ) : (
            //  since it's array we can map through and get back individual id and email
            // this is how our 'schema' looks, hence we use senderId and senderEmail - we didn;t make it up
            // interface IncomingFriendRequest {
            // senderId: string
            // senderEmail: string | null | undefined
            // }
            friendRequests.map((oneRequest) => {
                return <div key={oneRequest.senderId} className='flex gap-4 items-center'>
                    {/* here we select that we want to display UserPlus icon */}
                    <Icons.UserPlus className='text-black' />
                    {/* why senderEmail?  see note up */}
                    <p className='font-medium text-lg'>{oneRequest.senderEmail}</p>
                    <button className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md' aria-label='accept friend' onClick={() => acceptFriendRequest(oneRequest.senderId)}>
                        {/* Check is lucide icon */}
                        <Check className='font-semibold text-white w-3/4 h-3/4' />
                    </button>

                    <button className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md' aria-label='deny friend' onClick={() => denyFriendRequest(oneRequest.senderId)}>
                        {/* you have to pass the senderId because the function expects the id */}
                        <X className='font-semibold text-white w-3/4 h-3/4' />
                    </button>
                </div>
            })
        )}
    </>
}

export default FriendRequests