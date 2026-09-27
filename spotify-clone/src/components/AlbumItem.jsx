"use client";
import React from 'react'
import { useRouter } from 'next/navigation'

const AlbumItem = ({ image, name, desc, id }) => {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/album/${id}`)}
      className='group flex flex-col gap-2 p-3 rounded-lg bg-[#141414] hover:bg-[#1e1e1e] transition-colors cursor-pointer min-w-[160px] max-w-[160px]'
    >
      <div className='relative'>
        <img className='w-full aspect-square object-cover rounded' src={image} alt={name} />
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center'>
          <div className='w-9 h-9 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg'>
            <svg className='w-4 h-4 text-black ml-0.5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M8 5v14l11-7z'/>
            </svg>
          </div>
        </div>
      </div>
      <div>
        <p className='text-white text-sm font-semibold truncate leading-tight'>{name}</p>
        <p className='text-zinc-500 text-xs truncate mt-0.5'>{desc}</p>
      </div>
    </div>
  )
}

export default AlbumItem
