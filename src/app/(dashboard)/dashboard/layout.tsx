import { Icon, Icons } from '@/components/Icons'
import { authOptions } from '@/libraries/auth'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import SignOutButton from '@/components/SignOutButton'
import FriendRequestsSidebarOption from '@/components/FriendRequestsSidebarOption'
import { fetchRedis } from '@/helpers/redis'
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import SidebarChatlist from '@/components/SidebarChatlist'
import MobileChatLayout from '@/components/MobileChatLayout'
import { SidebarOption } from '@/types/typings'

interface LayoutProps {
    children: ReactNode
}


// we can you this approach to make it easier in case we will want to add several options, so it will be easy to add since we are using map function to show these options.
const sidebarOption: SidebarOption[] = [
    {
        id: 1,
        name: 'Add friend',
        href: '/dashboard/add',
        Icon: 'UserPlus'
    }
]

//if it is async you have to move the props at the end like this: { children }: LayoutProps)
const layout = async ({ children }: LayoutProps) => {

    // first we need to get the session, meaning you need this to see if the user is logged in and if you can show him this page in first place.
    // this is how you get the session
    const session = await getServerSession(authOptions)

    // if there is no session, you do not want to sho this page, so you can call notFound like this, but this is not enough to protect the route, later we will do some middlewares just to be sure 
    if (!session) notFound()

    // number of friends requests
    const initialUnseenRequestCount = ((await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`)) as User[]).length
    // .length because we only care about the number of friends requests, not the actual people and email addresses

    // now we want to display our friends so we need to find out who we have as friends 
    // you have this function defined somewhere else as helpers and it expects id of a user, because we will use it multiple times so you can just call it here and pass the id of the currently logged in user in there so we can find out who he has as friends
    const friends = await getFriendsByUserId(session.user.id)

    return <div className='w-full flex h-screen'>
        <div className='md:hidden '>
            <MobileChatLayout friends={friends} session={session} unseenRequestCount={initialUnseenRequestCount} sidebarOptions={sidebarOption} />
        </div>

        <div className='hidden md:flex max-w-xs grow w-full h-full flex-col gap-y-5 border-r border-gray-200 overflow-y-auto bg-white px-6'>
            <Link href='/dashboard' className='flex h-16 shrink-0 items-center'> <Icons.Logo className='h-8 w-auto text-indigo-600' /></Link>
            {/* we do not want to display chats if you actually dont have any friends, so you can conditionally render this div */}
            {friends.length ? (
                <div className='text-xs font-semibold leading-6 text-gray-400'>Your chats</div>
            ) : null}
            <nav className='flex flex-1 flex-col'>
                <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                    {/* here we render the chats what user has  and because there will be interaction with the user you need to render is as client side so we create a different client side component for that*/}
                    <li> <SidebarChatlist friends={friends} sessionId={session.user.id} /> </li>
                    <li>
                        <div className='text-xs font-semibold leading-6 text-gray-400'> Overview</div>
                        <ul role='list' className='-mx-2 mt-2 space-y-1'>

                            {/* here we map through the option that we set on top of this page */}
                            {sidebarOption.map((oneOption) => {
                                const Icon = Icons[oneOption.Icon]

                                return (
                                    <li key={oneOption.id}>
                                        <Link href={oneOption.href} className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                                            <span className='text-gray-400 border-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 flex w-6 h-6 shrink-0 items-center justify-center rounded-lg font-medium bg-white border text-[0.625rem]'>
                                                <Icon className='h-4 w-4' />
                                            </span>
                                            <span className='truncate'>{oneOption.name}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                            {/* FRIENDS REQUESTS */}
                            <li>
                                <FriendRequestsSidebarOption initialUnseenRequestCount={initialUnseenRequestCount} sessionId={session.user.id} />
                            </li>
                        </ul>
                    </li>


                    {/* YOUR PROFILE DOWN AT THE BOTTOM OF THE PAGE */}

                    <li className='-mx-6 mt-auto flex items-center'>
                        <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                            {/* here will be the images, by default with nextjs images are absolute hence the class relative is very important */}
                            <div className='relative h-8 w-8 bg-gray-50'>
                                {/* Image is nextJS thing, it's like regular image tag in html, but you need to declare element above it as relative - very important!  */}
                                <Image fill alt='Your profile picture' referrerPolicy='no-referrer' className='rounded-full' src={session.user.image || ''} />
                            </div>
                            {/* class sr-only is only for screen readers so it is more easy to navigate on our page  */}
                            <span className='sr-only'>Your profile</span>
                            <div className="flex flex-col">
                                {/*  we have to use session, so we get the profile picture and the email address of currently logged in user - so it will change depending on who is logged in */}
                                <span aria-hidden='true'>{session.user.name}</span>
                                <span className='text-xs text-zinc-400' aria-hidden='true'> {session.user.email} </span>
                            </div>
                        </div>
                        {/* log out button, we have to use component and because we will use onClick method on this and this button will be client side - this page is server side */}
                        <SignOutButton className='h-full aspect-square'></SignOutButton>

                    </li>
                </ul>
            </nav>
        </div>
        <aside className='max-h-screen max-w-7xl mx-auto px-4 lg:px-8 sm:px-6 py-16 md:py-12 w-full'>
            {children}
        </aside>
    </div>
}

export default layout