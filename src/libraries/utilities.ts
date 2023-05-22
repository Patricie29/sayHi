import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx nam umozni pouzivat conditional classNames
// tailwind-merge nam dela cleaner code a merguje classes together

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


//chat url helper constructor. it seperates the two ids with - - in the url
export function chatHrefConstructor(id1: string, id2: string) {

    const sortedIds = [id1, id2].sort()

    return `${sortedIds[0]}--${sortedIds[1]}`
}

//helper function for pusher - because we cannot have semicolons in the subscribe function
export const toPusherKey = (key: string) => {
    return key.replace(/:/g, '__')  // basically you are saying replace : g-means globally and replace them with double underscore __
}