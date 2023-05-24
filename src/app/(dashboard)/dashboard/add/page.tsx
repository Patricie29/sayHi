
import AddFriendButton from "@/components/AddFriendButton"



const page = ({ }) => {
    return <>
        <main className='pt-8'>
            <h1 className='font-bold text-4xl mb-8 dark:text-zinc-300'>Add a friend!</h1>
            <AddFriendButton />
        </main>
    </>
}

export default page