import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosfetch from '../api/axios'
import Loader from '../components/shared/Loader'
import ErrorMessage from '../components/shared/ErrorMessage'
import Avatar from '../components/shared/Avatar'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const [postRes, commentRes] = await Promise.all([
          axiosfetch.get(`/posts/${id}`),
          axiosfetch.get(`/posts/${id}/comments`),
        ])

        setPost(postRes.data)
        setComments(commentRes.data)
      } catch {
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate(-1)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [navigate])

  const closeModal = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  const handleAddComment = async (e) => {
    e.preventDefault()

    if (!commentText.trim() || commenting) return

    setCommenting(true)

    try {
      const { data } = await axiosfetch.post(`/posts/${id}/comments`, {
        content: commentText,
      })

      setComments((prev) => [...prev, data])
      setCommentText('')
      setPost((prev) => (prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev))
    } catch {
      // keep the composer quiet and simple
    } finally {
      setCommenting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosfetch.delete(`/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c._id !== commentId))
      setPost((prev) => (prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) } : prev))
    } catch {
      // keep the composer quiet and simple
    }
  }

  const backendUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

  const getImageSrc = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    if (imagePath.startsWith('/uploads')) return `${backendUrl}${imagePath}`
    if (imagePath.startsWith('uploads/')) return `${backendUrl}/${imagePath}`
    return `${backendUrl}/uploads/${imagePath}`
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
        <div className="w-full max-w-lg">
          <ErrorMessage message={error} />
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-3 py-4"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Comments</h2>
            <p className="text-xs text-gray-500">{comments.length} replies</p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close comments"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <Avatar src={post.author?.avatar} username={post.author?.username} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{post.author?.username}</p>
                  <span className="text-xs text-gray-400">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-gray-800 whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.image && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img
                      src={getImageSrc(post.image)}
                      alt="post"
                      className="w-full max-h-96 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            {comments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <Avatar src={c.author?.avatar} username={c.author?.username} size="sm" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">{c.author?.username}</p>
                        <span className="text-xs text-gray-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                    </div>

                    {user && user._id === c.author?._id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No comments yet. Be the first to reply.</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 p-4 bg-white">
          {user ? (
            <form onSubmit={handleAddComment} className="flex items-end gap-3">
              <Avatar src={user.avatar} username={user.username} size="sm" />

              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{user.username}</span>
                  <span className="text-xs text-gray-400">commenting as you</span>
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={commenting || !commentText.trim()}
                className="h-11 px-5 rounded-2xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {commenting ? 'Sending...' : 'Send'}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Login to write a comment.</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="h-11 px-5 rounded-2xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetail
