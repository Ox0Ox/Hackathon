"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from 'react'

const Navbar = () => {
    const [showdrop, setshowdrop] = useState(false)
    const { data: session } = useSession()
    return (
        <>
            {session && <nav className='flex justify-between bg-gray-800 text-white py-3 sticky top-0 z-10 items-center'>
                <Link href={'/'}><div className='flex items-center justify-center ml-10 '>
                    <img className='relative top-1' src="/help.gif" alt="" width={50} />
                    <div className="logo text-2xl font-bold italic">Grievance :D</div>
                </div></Link>
                <ul className='flex mr-10 text-lg justify-center items-center'>
                    <li className='hover:cursor-pointer hover:font-bold w-20 text-center'><Link href={'/'}>Home</Link></li>
                    <li className='hover:cursor-pointer hover:font-bold w-20 text-center'><Link href={'/about'}>About</Link></li>
                    <li className='relative'>
                        <button id="dropdownDefaultButton" onClick={()=>{setshowdrop(!showdrop)}}  onBlur={()=> {setTimeout(() => {
                            setshowdrop(false)
                        }, 300);}} data-dropdown-toggle="dropdown" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">{session.user.name}<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                        </svg>
                        </button>

                        {/* <!-- Dropdown menu --> */}
                        <div id="dropdown" className={`z-10 ${showdrop?'':'hidden'} flex flex-col justify-center items-center absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700`}>
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                                <li>
                                    <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</Link>
                                </li>
                                <li>
                                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Profile</Link>
                                </li>
                                <li>
                                <Link href='' onClick={() => signOut({ callbackUrl: '/' })} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500">Logout</Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </nav>}
            {!session && <nav className='flex justify-between bg-gray-800 text-white py-3 sticky top-0 z-10 items-center'>
                <Link href={'/'}>
                <div className='flex items-center justify-center ml-10 '>
                    <img className='rounded-full mr-2' src="/help.gif" alt="" width={50} />
                    <div className="logo text-2xl font-bold italic">Grievance :D</div>
                </div>
                </Link>
                <ul className='flex mr-10 text-lg justify-center items-center'>
                    <li className='hover:cursor-pointer hover:font-bold w-20 text-center'><Link href={'/'}>Home</Link></li>
                    <li className='hover:cursor-pointer hover:font-bold w-20 text-center'><Link href={'/about'}>About</Link></li>
                    <li className='hover:cursor-pointer hover:font-bold w-20 text-center'><Link href={'/login'}><button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Login</button></Link></li>
                </ul>
            </nav>}
        </>
    )
}

export default Navbar