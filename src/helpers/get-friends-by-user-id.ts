


// retrieve frriends for currently logged in user

import { fetchRedis } from "./redis"

export const getFriendsByUserId = async (userId: string) => {

    // we need to get the ids of all friends first
    // second parametr is where you get them from - we have them in the friends 'folder'
    const friendIds = await fetchRedis('smembers', `user:${userId}:friends`) as string[]  // you want to recieve an array of strings, because that is what the ids will be

    const allFriends = await Promise.all(  // again promise.all so it's all callled at the same time and it doesnt wait for one id to be fetched first before it moves to next one -> better efficiency of the app
        friendIds.map(async (oneId) => {  // now you're maping throug the ids that you got from the last step and you want to get their details, their name email, image etc. User is our 'schema' of how our user should look so you basically are creating User for each of the ids you fetched from the friends folder
            const friend = await fetchRedis('get', `user:${oneId}`) as string

            const parsedFriend = JSON.parse(friend) as User
            return parsedFriend
        })
    )

    return allFriends

}