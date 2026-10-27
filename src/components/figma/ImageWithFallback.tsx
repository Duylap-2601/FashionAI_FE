'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

type ImageWithFallbackProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string
}

export function ImageWithFallback({ src, alt, ...props }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)

  if (didError) {
    return (
      <Image
        src={ERROR_IMG_SRC}
        alt="Error loading image"
        width={88}
        height={88}
        unoptimized
        {...props}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      unoptimized
      onError={() => setDidError(true)}
      {...props}
    />
  )
}
