import { z } from "zod"; //this packages allows us to define schemas that are then validating the user input



export const addFriendValidator = z.object({
    email: z.string().email()  //this makes sure it's validated and it looks like email format
})