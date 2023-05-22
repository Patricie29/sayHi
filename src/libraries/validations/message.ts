import { z } from "zod"; //this packages allows us to define schemas that are then validating the user input


// this is validation for just one message
export const messageValidator = z.object({
    id: z.string(),
    senderId: z.string(),
    text: z.string().max(2000),
    timestamp: z.number(),
})


// now we need to validate the whole array of messages
export const messageArrayValidator = z.array(messageValidator)


// this is zod utility function that gives us to infer the type of the message
export type Message = z.infer<typeof messageValidator>