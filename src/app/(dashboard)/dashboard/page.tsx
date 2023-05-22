import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/libraries/auth";
import { chatHrefConstructor } from "@/libraries/utilities";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";




const page = async () => {

    const session = await getServerSession(authOptions)

    if (!session) notFound()

    const friends = await getFriendsByUserId(session.user.id)

    // we want to show the last messages from people on the main page
    const friendsWithLastMessage = await Promise.all(
        friends.map(async (oneFriend) => {
            // it goes in [] because we are destructuring the first elemenet from an array and we will get back an array of messages
            const [lastMessageRaw] = await fetchRedis('zrange', `chat:${chatHrefConstructor(session.user.id, oneFriend.id)}:messages`, -1, -1) as string[]

            const lastMessage = JSON.parse(lastMessageRaw) as Message

            return {
                ...oneFriend, // returning every property that this friend has
                lastMessage
            }
        })
    )

    return <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-bold text-5xl mb-8">Recent Chats</h1>

        {friendsWithLastMessage.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing to show here...</p>
        ) : (
            friendsWithLastMessage.map((oneFriend) => {
                return <div key={oneFriend.id} className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md">
                    <div className='absolute right-4 inset-y-0 flex items-center'>
                        <ChevronRight className="h-7 w-7 text-zinc-400" />
                    </div>
                    <Link href={`/dashboard/chat/${chatHrefConstructor(session.user.id, oneFriend.id)}`} className="relative sm:flex">
                        <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                            <div className="relative h-6 w-6">
                                <Image referrerPolicy="no-referrer" className="rounded-full" alt={`${oneFriend.name} profile picture`} src={oneFriend.image} fill />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold">{oneFriend.name}</h4>
                            <p className="mt-1 max-w-md">
                                <span className="text-zinc-400"> {oneFriend.lastMessage.senderId === session.user.id ? 'You' : ' '} </span>
                                {oneFriend.lastMessage.text}
                            </p>
                        </div>
                    </Link>
                </div>
            })
        )}
    </div>

}


export default page