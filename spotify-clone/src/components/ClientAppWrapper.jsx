"use client";
import React, { useContext } from 'react'
import Sidebar from './Sidebar'
import Player from './Player'
import { PlayerContext } from '../context/PlayerContext'
import DisplayWrapper from './DisplayWrapper'

export default function ClientAppWrapper({ children }) {
  const { audioRef, track } = useContext(PlayerContext)

  return (
    <div className='h-screen bg-[#0f0f0f] flex flex-col'>
      {/* Main content row */}
      <div className='flex flex-1 min-h-0 gap-2 p-2'>
        {/* Sidebar with its own scroll */}
        <div className='bg-[#141414] rounded-lg hidden lg:flex flex-col overflow-hidden'>
          <Sidebar />
        </div>
        {/* Display area */}
        <div className='flex-1 bg-[#141414] rounded-lg overflow-hidden'>
          <DisplayWrapper>
            {children}
          </DisplayWrapper>
        </div>
      </div>

      {/* Player bar */}
      <Player />

      {/* Hidden audio element */}
      <audio ref={audioRef} src={track ? track.file : undefined} preload='auto' />
    </div>
  )
}
