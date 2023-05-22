'use client'

import { ButtonHTMLAttributes, FC, useState } from 'react'
import Button from './ui/Button'
import { signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Loader2, LogOut } from 'lucide-react'


//because on this button we will add some seperate classes in layout, we need to extend this prop
// thanks to ButtonHTMLAttributes<HTMLButtonElement>  we can use different elements on the button like onClick, onChange etc
interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {

}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
    const [isSigningOut, setIsSigningOut] = useState<boolean>(false)

    const signOutHandler = async () => {
        setIsSigningOut(true)
        try {
            await signOut()
        } catch (error) {
            toast.error('There was a problem signing out.')
        } finally {
            setIsSigningOut(false)
        }
    }

    return <Button {...props} variant='ghost' onClick={signOutHandler}>
        {/* so either we display loading icon from lucide or we display signout icon also from lucide */}
        {isSigningOut ? <Loader2 className='h-4 w-4 animate-spin' /> : <LogOut className='w-4 h-4' />}
    </Button>
}

export default SignOutButton