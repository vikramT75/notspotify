"use client";
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthContext } from '../context/AuthContext'
import AuthModal from './AuthModal'

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext)
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [isLoginView, setIsLoginView] = React.useState(true)
  const router = useRouter()

  return (
    <>
      <div className='w-full flex justify-between items-center py-2 border-b border-[#1f1f1f] mb-6'>
        {/* Page title slot — children can override, default empty */}
        <span />
        <div className='flex items-center gap-3'>
          {user ? (
            <div className='relative group'>
              <div className='flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full bg-[#1a1a1a] hover:bg-[#242424] transition-colors'>
                <div className='w-6 h-6 rounded-full bg-[#1db954] flex items-center justify-center text-black text-xs font-bold select-none'>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className='text-sm font-medium text-white'>{user.username}</span>
                <svg className='w-3 h-3 text-zinc-400' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M7 10l5 5 5-5z'/>
                </svg>
              </div>
              <div className='absolute right-0 top-full mt-1 hidden group-hover:block z-50'>
                <div className='bg-[#282828] border border-[#333] text-white rounded-lg shadow-xl p-1 min-w-[140px]'>
                  <button
                    onClick={logout}
                    className='w-full text-left px-3 py-2 text-sm hover:bg-[#383838] rounded transition-colors text-zinc-300 hover:text-white'
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => { setIsLoginView(false); setShowAuthModal(true); }}
                className='text-zinc-400 font-medium cursor-pointer hover:text-white text-sm px-3 py-1.5 transition-colors'
              >
                Sign up
              </button>
              <button
                onClick={() => { setIsLoginView(true); setShowAuthModal(true); }}
                className='bg-white text-black text-sm px-5 py-1.5 rounded-full font-semibold hover:bg-zinc-200 transition-colors'
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} defaultIsLogin={isLoginView} />}
    </>
  )
}

export default Navbar
