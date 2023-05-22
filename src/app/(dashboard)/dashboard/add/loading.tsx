import { FC } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const loading: FC = () => {
    return <div className='w-full flex flex-col gap-3'>
        <Skeleton className='mb-4' height={60} width={500} />
        <Skeleton height={20} width={150} />
        <Skeleton height={50} width={400} />
    </div>
}

export default loading


// this is a loading file, next js automatically looks for this file and this is hwat is shown while you original page is loading.
// for loading purposes we used react package called skeleton

// 7h07m