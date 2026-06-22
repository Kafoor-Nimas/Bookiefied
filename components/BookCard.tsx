import { BookCardProps } from '@/type'
import Link from 'next/link'
import React from 'react'

const BookCard = ({title,author,coverURL,slug}:BookCardProps) => {
  return (
    <Link href={`/books/${slug}`}>BookCard</Link>
  )
}

export default BookCard