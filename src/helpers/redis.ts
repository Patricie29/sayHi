// YOUTUBE 2h


// tady si muzes preulozit do jednoduchyho const abys furt nemusela vypisovat process.env.atdatd
const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN

// Command bude jedno z tohoto
type Command = 'zrange' | 'sismember' | 'get' | 'smembers'


// function that helps us interact with our database 
export async function fetchRedis(
    command: Command,
    // this is how we will catch all the other arguments pasted into the function and that will either be a string or number - array 
    ...args: (string | number)[]
) {  // now here within the body function you can ahndle the redis response 
    // first you need to construct the URL to where you get the fetch request to
    // ve finale je to jako toto  " await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}` "
    // arg is an array so you need to join the things in the array with / like this: ${args.join('/')}
    const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join('/')}`

    const response = await fetch(commandUrl, {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
        cache: 'no-store',
    })

    // quick validation
    if (!response.ok) {
        throw new Error(`Error executing Redis command: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
}

