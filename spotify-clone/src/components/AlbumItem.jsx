"use client";
import React from 'react'
import { useRouter } from 'next/navigation'

const AlbumItem = ({image,name,desc,id}) => {

    const router = useRouter()

  return (
    <div onClick={()=>router.push(`/album/${id}`)} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
      <img className='rounded' src={image} alt="" />
      <p className='font-bold mt-2 mb-1'>{name}</p>
      <p className='text-slate-200 text-sm'>{desc}</p>
    </div>
  )
}

export default AlbumItem
