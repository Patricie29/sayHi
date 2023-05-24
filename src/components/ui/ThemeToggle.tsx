'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { FC } from 'react'
import Button from './Button'

interface ThemeToggleProps {

}

const ThemeToggle: FC<ThemeToggleProps> = ({ }) => {

    const { theme, setTheme } = useTheme()

    return <>
        {/* <div className='text-indigo-200 border-indigo-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-blue-900'> */}
        <div className='h-8 w-auto'>
            <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} variant='ghost' className='group ring-slate-400 ring-2'>
                {theme === 'light' ? (
                    <Moon className='h-7 w-7 rotate-0 scale-100 transition-all hover:text-slate-900 group-hover:text-slate-900 dark:-rotate-90  text-indigo-600' />
                ) : (
                    <Sun className='h-7 w-7 rotate-0 scale-100 transition-all dark:group-hover:text-zinc-300 hover:text-zinc-300 dark:-rotate-90  text-indigo-600' />

                )}
            </Button>
        </div >

    </>

}

export default ThemeToggle