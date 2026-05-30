
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosfetch from '../api/axios'
import PostCard from '../components/posts/PostCard'
import Loader from '../components/shared/Loader'
import ErrorMessage from '../components/shared/ErrorMessage'
import Avatar from '../components/shared/Avatar'
import Button from '../components/shared/Button'

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

  const handleAddComment = async (e) => {
    e.preventDefault()

    if (!commentText.trim()) return
    setCommenting(true)

    try {

      const { data } = await axiosfetch.post(`/posts/${id}/comments`, { content: commentText })
      setComments([...comments, data])
      setCommentText('')

    } catch {
      // silently skip
    } finally {

      setCommenting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {

    try {
      await axiosfetch.delete(`/comments/${commentId}`)
      setComments(comments.filter((c) => c._id !== commentId))

    } catch {
      // silently skip
    }
  }

  if (loading) return <Loader />

  if (error) return <ErrorMessage message={error} />
  if (!post) return null

  const handlePostDeleted = () => {

    navigate('/', { replace: true })
  }

  return (

    <div className="flex flex-col gap-4">

      <PostCard post={post} onDelete={handlePostDeleted} />

      
      <div className="bg-white border border-gray-200 rounded-xl p-4">

        <h3 className="text-sm font-semibold text-gray-700 mb-4">

          Comments ({comments.length})
        </h3>

        {comments.map((c) => (
          <div key={c._id} className="flex gap-3 py-3 border-b border-gray-100 last:border-b-0">

            <Avatar src={c.author?.avatar} username={c.author?.username} size="sm" />

            <div className="flex-1">

              <p className="text-xs font-medium text-gray-900 mb-1">{c.author?.username}</p>
              <p className="text-sm text-gray-700">{c.content}</p>

            </div>
            {user && user._id === c.author?._id && (

              <button
                onClick={() => handleDeleteComment(c._id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete

              </button>
            )}
          </div>
        ))}

       
        {user && (
          <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
            <input
              type="text"
              value={commentText}
              
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
            <Button type="submit" disabled={commenting}>
              {commenting ? '...' : 'Post'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default PostDetail
