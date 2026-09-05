"use client";
import React from 'react'
import { assets } from '../assets/assets'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../context/AuthContext'
import AuthModal from './AuthModal'

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext)
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [isLoginView, setIsLoginView] = React.useState(true)


  const router = useRouter()

  const goBack = () => {
    if (window.history.length > 2) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <div className='w-full flex justify-between items-center font-semibold'>
        <div className='flex items-center gap-2'>
            <img onClick={goBack} className='w-8 bg-black p-2 rounded-2xl cursor-pointer' src={assets.arrow_left} alt="" />
            <img onClick={()=>router.forward()} className='w-8 bg-black p-2 rounded-2xl cursor-pointer' src={assets.arrow_right} alt="" />
        </div>
        <div className='flex items-center gap-4'>
            {user ? (
                <div className='relative group'>
                    <p className='bg-purple-500 text-black w-7 h-7 rounded-full flex items-center justify-center cursor-pointer'>
                        {user.username.charAt(0).toUpperCase()}
                    </p>
                    <div className='absolute right-0 top-full pt-2 hidden group-hover:block z-50'>
                        <div className='bg-[#282828] text-white rounded shadow-lg p-2 min-w-[120px]'>
                            <p className='px-2 py-1 text-sm font-semibold truncate'>{user.username}</p>
                            <hr className='border-zinc-600 my-1'/>
                            <button onClick={logout} className='w-full text-left px-2 py-1 text-sm hover:bg-zinc-700 rounded'>Log out</button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <p onClick={() => { setIsLoginView(false); setShowAuthModal(true); }} className='text-zinc-400 font-bold cursor-pointer hover:text-white px-2'>Sign up</p>
                    <button onClick={() => { setIsLoginView(true); setShowAuthModal(true); }} className='bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105'>Log in</button>
                </>
            )}
        </div>
      </div>
      <div className='flex items-center gap-2 mt-4'>
            <p className='bg-white text-black px-4 py-1 rounded-2xl cursor-pointer'>All</p>
            <p className='bg-black px-4 py-1 rounded-2xl cursor-pointer'>Music</p>
            <p className='bg-black px-4 py-1 rounded-2xl cursor-pointer'>Podcasts</p>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} defaultIsLogin={isLoginView} />}
    </>
  )
}

export default Navbar
