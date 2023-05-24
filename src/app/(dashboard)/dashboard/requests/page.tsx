import FriendRequests from '@/components/FriendRequests'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/libraries/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'


const page = async ({ }) => {

    const session = await getServerSession(authOptions)

    if (!session) notFound()

    // ids of people who sent current logged in user a friend request
    const incomingSendersIds = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[]  // as string becasue we are getting back a bunch of ids and those are strings 

    // now we need the email address of the users
    const incomingFriendRequests = await Promise.all(
        // Promise.all lets us await array of  promises simountaneously - so each incoming friends request will be fetched at the same time and not one by one - this makes much better performance 
        // await Promise.all also waits for all the requests to be finished before continuing next
        // By using Promise.all, multiple asynchronous operations are executed concurrently, and the code waits for all of them to complete before proceeding, ensuring that the incomingFriendRequests array is populated with the results of all the asynchronous operations.
        incomingSendersIds.map(async (senderId) => {
            const sender = await fetchRedis('get', `user:${senderId}`) as string  // we recieve the data as a string so we need to parse it on the next step
            const senderParsed = JSON.parse(sender) as User //as User protoze tam mame definuty jak ten User vypada, tedy ze ma email, jmeno, id atd
            // and we want to return the id and the email. Id for us to work with and email to display to the user so he knows who sent the friend request
            return {
                senderId,
                senderEmail: senderParsed.email
            }
        })
    )

    return <>
        <main className='pt-8'>
            <h1 className='font-bold text-4xl mb-8'>Friend Requests</h1>
            <div className='flex flex-col gap-4'>
                <FriendRequests incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id} />
            </div>
        </main>
    </>
}

export default page 