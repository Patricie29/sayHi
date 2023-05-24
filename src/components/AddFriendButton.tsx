'use client'

import { FC, useState } from 'react'
import Button from './ui/Button'
import { addFriendValidator } from '@/libraries/validations/add-friend'
import axios, { AxiosError } from 'axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'



type FormData = z.infer<typeof addFriendValidator> //with this we override zod into typescript type

const AddFriendButton: FC = () => {
    const [showSuccess, setShowSuccess] = useState<boolean>(false)

    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({  // <FormData> will allow us to register input fields 
        resolver: zodResolver(addFriendValidator)  // here we're saying if the input is not legit, the zod will handle the error for us
    })

    const addFriend = async (email: string) => {
        try {
            const validatedEmail = addFriendValidator.parse({ email })  // this is how we validate it's valid email, addFriendValidator is where we did the function and here we parse it and send email there that we recieve

            //to send a request we will use axios
            // the logic behind this post request is under api/friends/add/route and we send the validated email there as well
            await axios.post('/api/friends/add', {
                email: validatedEmail
            })

            setShowSuccess(true)
        } catch (error) {
            // you can also add a toast pop up error message if you want
            if (error instanceof z.ZodError) {  //here we can take advantage of the library that we have called zod, that can actually handle the error for us. So this is how we check if it is the zod error, meaning if the error exists in zod 
                setError('email', { message: error.message })
                // here you specify in which field the error happened, so you an individually set the field or you can select all, in our case we only have email input. the message is how you get the error message in zod, in axios is a bit different, see below,
                return
            }
            if (error instanceof AxiosError) {
                setError('email', { message: error.response?.data })
                return
            }

            //if we couldn't indentify the error, meaning if it's not axios or zod error, we can just generate universal message like this:
            setError('email', { message: 'Something went wrong.' })
        }
    }

    const onSubmitForm = (data: FormData) => {
        addFriend(data.email)
    }


    return <form onSubmit={handleSubmit(onSubmitForm)} className='max-w-sm'>
        <label htmlFor="email" className='block text-sm font-medium leading-6 text-gray-900 dark:text-zinc-300'>Add your friend by email </label>
        <div className='mt-2 flex gap-4'>
            <input
                {...register('email')}
                type="text"
                className='block rounded-md w-full border-0 py-1.5 shadow-sm ring-1 ring-inset ring-grey-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                placeholder='you@example.com' />
            <Button className='dark:bg-dark-slate-200 dark:hover:bg-dark-slate-700 dark:text-zinc-300'>Add</Button>
        </div>
        <p className='mt-1 text-sm text-red-600'>
            {errors.email?.message}
        </p>
        {showSuccess ? (<p className='mt-1 text-sm text-green-600'> Friend request sent! </p>) : null}

    </form>
}

export default AddFriendButton