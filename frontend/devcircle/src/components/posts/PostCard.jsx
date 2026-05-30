import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { likePost, unlikePost, deletePost, repostPost } from '../../features/posts/postSlice'
import Avatar from '../shared/Avatar'

const PostCard = ({ post, onDelete }) => {

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const backendUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
  const postRef = post.postNumber || post._id

  const getImageSrc = (imagePath) => {

    if (!imagePath) return ''
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath

    if (imagePath.startsWith('/uploads')) return `${backendUrl}${imagePath}`
    if (imagePath.startsWith('uploads/')) return `${backendUrl}/${imagePath}`
    return `${backendUrl}/uploads/${imagePath}`
  }

  const [liked, setLiked] = useState(

    user && post.likes ? post.likes.includes(user._id) : false
  )
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)

  const [repostStatus, setRepostStatus] = useState('')

  const handleLike = () => {
    if (!user) return
    if (liked) {
      dispatch(unlikePost(post._id))

      setLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))

    } else {
      dispatch(likePost(post._id))
      setLiked(true)

      setLikeCount((c) => c + 1)
    }
  }

  const handleRepost = async () => {

    if (!user) return

    const sourceId = post.repostOf?._id || post._id

    const result = await dispatch(repostPost(sourceId))

    if (repostPost.fulfilled.match(result)) {

      setRepostStatus('done')
    } else {
      setRepostStatus('failed')
    }

    setTimeout(() => setRepostStatus(''), 2000)
  }

  const handleDelete = async () => {

    if (window.confirm('Delete this post?')) {
      const result = await dispatch(deletePost(post._id))
      if (deletePost.fulfilled.match(result) && onDelete) {
        onDelete(post)
      }

    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Repost */}
      {post.repostOf && (
        <div className="mb-2 text-xs text-gray-500 flex items-center gap-1.5">
          <i className="fa-solid fa-retweet text-gray-400" />
          <span>
            Reposted from
            {' '}
            <Link to={`/profile/${post.repostOf.author?.username}`} className="text-blue-600 hover:underline">
              @{post.repostOf.author?.username}

            </Link>
          </span>
        </div>
      )}

    
      <div className="flex items-start justify-between mb-3">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2">
          <Avatar src={post.author?.avatar} username={post.author?.username} size="md" />
          <div>
            <p className="text-sm font-medium text-gray-900">{post.author?.username}</p>
            <p className="text-xs text-gray-400">

              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>

        {user && user._id === post.author?._id && (
          <button
            onClick={handleDelete}

            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50"
          >
            <i className="fa-solid fa-trash-can" />
          </button>
        )}
      </div>

      
      <Link to={`/posts/${postRef}`}>

        <p className="text-gray-800 text-sm leading-relaxed mb-3">{post.content}</p>

        {post.image && (
          <div className="mb-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            <img
              src={getImageSrc(post.image)}
              alt="post"
              className="w-full max-h-96 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}

      </Link>


      {post.tags?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">

          {post.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
            >
              #{tag}

            </span>
          ))}
        </div>
      )}

   
      <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
        {/* Like */}
        <button
          onClick={handleLike}

          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            liked
              ? 'text-red-500 bg-red-50'

              : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <i className={`${liked ? 'fa-solid' : 'fa-regular'} fa-heart`} />
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>


        {/* Comment */}
        <Link
          to={`/posts/${postRef}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <i className="fa-regular fa-comment" />
          <span>{post.commentCount > 0 ? post.commentCount : ''}</span>

        </Link>

        {/* Repost */}
        <button
          onClick={handleRepost}

          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ml-auto ${
            repostStatus === 'done'
              ? 'text-green-600 bg-green-50'
              : repostStatus === 'failed'
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
          }`}
        >
          <i className={repostStatus === 'done' ? 'fa-solid fa-check' : 'fa-solid fa-retweet'} />
          
          <span className="text-xs">
            {repostStatus === 'done' ? 'Reposted!' : repostStatus === 'failed' ? 'Failed' : 'Repost'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default PostCard

