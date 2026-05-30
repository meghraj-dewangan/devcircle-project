import { useEffect, useState } from 'react'

//  shows image if available, otherwise initial letter.
const Avatar = ({ src, username, size = 'md' }) => {

  const sizes = {

    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  const [imageError, setImageError] = useState(false)

  const initial = username ? username[0].toUpperCase() : '?'
  const backendUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

  const getAvatarSrc = (imagePath) => {

    if (!imagePath) return ''
    if (imagePath.startsWith('blob:') || imagePath.startsWith('data:')) return imagePath

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath

    if (imagePath.startsWith('/uploads')) return `${backendUrl}${imagePath}`
    if (imagePath.startsWith('uploads/')) return `${backendUrl}/${imagePath}`
    return `${backendUrl}/uploads/${imagePath}`
  }

  useEffect(() => {

    setImageError(false)
  }, [src])

  const hasImage = src && !imageError

  return (

    <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0`}>

      {hasImage ? (
        <img
          src={getAvatarSrc(src)}
          alt={username}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />

      ) : (
        <div
          className={`${sizes[size]} bg-blue-100 text-blue-600 font-semibold rounded-full flex items-center justify-center`}
        >

          {initial}

        </div>
      )}
      
    </div>
  )
}

export default Avatar

