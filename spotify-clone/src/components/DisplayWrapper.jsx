"use client";
import React, { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const DisplayWrapper = ({ children }) => {

  const { albumsData } = useContext(PlayerContext)

  const displayRef = useRef();
  const pathname = usePathname() || "";
  const isAlbum = pathname.includes("album");
  const albumId = isAlbum ? pathname.split("/").pop() : "";
  const bg = isAlbum && albumsData.length > 0 ? albumsData.find((x) => (x._id == albumId))?.bgColour : "#121212";
  const bgColor = bg || "#121212";

  useEffect(() => {
    if (isAlbum) {
      displayRef.current.style.background = `linear-gradient(${bgColor},#121212)`
    }
    else {
      displayRef.current.style.background = `#121212`
    }
  })

  return (
    <div ref={displayRef} className='w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0'>
      {children}
    </div>
  )
}

export default DisplayWrapper
