import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../../features/posts/postSlice'
import axiosfetch from '../../api/axios'
import Avatar from '../shared/Avatar'

const PostForm = () => {
  const dispatch = useDispatch()

  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const [aiStatus, setAiStatus] = useState('')

  const redirectGuestToLogin = () => {
    if (user) return false
    navigate('/login')
    return true
  }

  const handleImageChange = (e) => {
    if (redirectGuestToLogin()) return

    const file = e.target.files[0]
    if (!file) return

    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview('')
  }

  const handleGeneratePost = async () => {

    if (redirectGuestToLogin()) return
    if (!content.trim()) return

    setAiLoading(true)
    setAiError('')
    setAiStatus('')

    try {
      const { data } = await axiosfetch.post('/ai/improve-post', { content })
      setContent(data.improved || content)
      setAiStatus('Generated.')
      setAiError('')
    } catch (error) {

      const message = error?.response?.data?.message || 'AI generation failed. Please try again.'
      setAiError(message)
      setAiStatus('')
    } finally {

      setAiLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (redirectGuestToLogin()) return
    if (!content.trim()) return

    setLoading(true)

    const formData = new FormData()
    formData.append('content', content)
    if (image) formData.append('image', image)

    const result = await dispatch(createPost(formData))

    if (createPost.fulfilled.match(result)) {

      setContent('')
      setImage(null)
      setImagePreview('')
      setAiStatus('')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4">
      {aiError && (

        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-500 flex items-center justify-between">
          <span>{aiError}</span>
          <button type="button" onClick={() => setAiError('')} className="text-red-300 hover:text-red-500 ml-2">
            <i className="fa-solid fa-xmark" />

          </button>
        </div>
      )}

      {aiStatus && (

        <p className="mb-2 text-xs text-blue-600">{aiStatus}</p>
      )}

      <div className="flex gap-3">
        <Avatar src={user?.avatar} username={user?.username} size="md" />

        <div className="flex-1">

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with the developer community..."
            rows={3}
            maxLength={1000}
            className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none border-0 outline-none"
          />

          {imagePreview && (

            <div className="relative mt-2 inline-block">
              <img
                src={imagePreview}
                alt="preview"
                className="rounded-lg max-h-48 object-cover border border-gray-100"
              />

              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-opacity-70"
              >
                <i className="fa-solid fa-xmark text-[10px]" />
              </button>

            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">

              <label
                title="Add image"
                className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              >
                <i className="fa-solid fa-image text-sm" />

                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <span className="w-px h-4 bg-gray-200 mx-1" />

              <button
                type="button"
                onClick={handleGeneratePost}
                disabled={aiLoading || !content.trim()}
                title="Generate post"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {aiLoading ? (
                  <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                )}
                Generate
              </button>

            </div>

            <div className="flex items-center gap-2">

              <span className="text-xs text-gray-300">{content.length}/1000</span>
              <button
                type="submit"
                disabled={loading || !content.trim()}

                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </form>
  )
}

export default PostForm
