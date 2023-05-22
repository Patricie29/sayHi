
// v tehle file si nastavime jak bude User vypadat a co bude obsahovat
interface User {
    name: string
    email: string
    image: string
    id: string
}


// YOUTUBE 4h 20min
// this is our chat
interface Chat {
    id: string
    messages: Message[]
}


// tady si nastavime jak bude vypadat nase message a co bude obsahovat
interface Message {
    id: string
    senderId: string
    recieverId: string
    text: string
    timestamp: number
}

// tady si nastavime jak bude vypadat nase friendrequest a co bude obsahovat
interface FriendRequest {
    id: string
    senderId: string
    recieverId: string
}

