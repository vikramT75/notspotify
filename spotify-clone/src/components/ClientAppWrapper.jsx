"use client";
import React, { useContext } from 'react'
import Sidebar from './Sidebar'
import Player from './Player'
import { PlayerContext } from '../context/PlayerContext'
import DisplayWrapper from './DisplayWrapper'

export default function ClientAppWrapper({ children }) {
  const { audioRef, track, songsData } = useContext(PlayerContext);

  return (
    <div className='h-screen bg-black'>
      <div className='h-[90%] flex'>
        <Sidebar />
        <DisplayWrapper>
          {children}
        </DisplayWrapper>
      </div>
      <Player />
      <audio ref={audioRef} src={track ? track.file : undefined} preload='auto'></audio>
    </div>
  )
}
