"use client";
import React, { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const DisplayWrapper = ({ children }) => {
  const { albumsData } = useContext(PlayerContext)
  const displayRef = useRef()
  const pathname = usePathname() || ''
  const isAlbum = pathname.includes('/album/')
  const albumId = isAlbum ? pathname.split('/').pop() : ''
  const albumBg = isAlbum && albumsData.length > 0
    ? albumsData.find(x => String(x._id || x.id) === albumId)?.bgColour
    : null

  useEffect(() => {
    if (!displayRef.current) return
    if (isAlbum && albumBg) {
      displayRef.current.style.background = `linear-gradient(160deg, ${albumBg}22 0%, #0f0f0f 40%)`
    } else {
      displayRef.current.style.background = '#0f0f0f'
    }
  })

  return (
    <div
      ref={displayRef}
      className='flex-1 min-w-0 overflow-y-auto px-6 pt-4 pb-6 text-white'
      style={{ background: '#0f0f0f' }}
    >
      {children}
    </div>
  )
}

export default DisplayWrapper
