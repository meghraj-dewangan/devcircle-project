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

  const [suggestedTags, setSuggestedTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  const normalizeTag = (value) => value.toLowerCase().trim().replace(/^#/, '')

  const redirectGuestToLogin = () => {
    if (user) return false
    navigate('/login')

    return true
  }

  const improvePostLocally = (value) => {
    const cleaned = value.replace(/\s+/g, ' ').trim()
    if (!cleaned) return ''
    const first = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    return first.endsWith('.') ? first : `${first}.`
  }

  const generateBasicTags = (text) => {
    const lower = text.toLowerCase()
    const tags = []

    
    const hashtagMatches = lower.match(/#[a-z0-9_]+/g) || []
    hashtagMatches.forEach((tag) => tags.push(normalizeTag(tag)))

    // 2) Add simple keyword-based tags only if ai fails
    const keywordMap = [
      ['react', 'react'],
      ['node', 'nodejs'],
      ['express', 'express'],
      ['mongo', 'mongodb'],
      ['javascript', 'javascript'],
      ['typescript', 'typescript'],
      ['api', 'api'],
      ['flutter', 'flutter'],

      ['laravel', 'laravel'],
      ['java', 'java'],
      ['python', 'python'],
      ['php', 'php'],
    ]

    keywordMap.forEach(([key, tag]) => {

      if (lower.includes(key)) tags.push(tag)
    })

    return [...new Set(tags)].slice(0, 5)
  }

  const handleImageChange = (e) => {

    if (redirectGuestToLogin()) return

    const file = e.target.files[0]

    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {

    setImage(null)
    setImagePreview('')
  }

  const handleImproveWithAI = async () => {

    if (redirectGuestToLogin()) return
    if (!content.trim()) return

    setAiLoading(true)
    setAiError('')
    setAiStatus('')

    try {

      const { data } = await axiosfetch.post('/ai/improve-post', { content })
      setContent(data.improved)

      setAiStatus('Improved.')
    } catch {
      setContent(improvePostLocally(content))
      setAiStatus('Improved.')

      setAiError('')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSuggestTags = async () => {

    if (redirectGuestToLogin()) return
    if (!content.trim()) return
    setAiLoading(true)
    setAiError('')

    setAiStatus('')

    try {
      const { data } = await axiosfetch.post('/ai/generate-tags', { content })

      const tags = Array.isArray(data.tags) ? data.tags : []
      if (tags.length > 0) {
        setSuggestedTags(tags.map(normalizeTag).filter(Boolean).slice(0, 5))

      } else {
        setSuggestedTags(generateBasicTags(content))
      }
      setAiStatus('Generated.')
    } catch {
      setSuggestedTags(generateBasicTags(content))

      setAiStatus('Generated.')
      setAiError('')
    } finally {

      setAiLoading(false)
    }
  }

  const addSelectedTag = (tag) => {

    const cleaned = normalizeTag(tag)
    if (!cleaned) return

    if (selectedTags.includes(cleaned)) return
    if (selectedTags.length >= 5) return

    setSelectedTags((prev) => [...prev, cleaned])
  }

  const removeSelectedTag = (tag) => {

    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = async (e) => {

    e.preventDefault()
    if (redirectGuestToLogin()) return

    if (!content.trim()) return

    setLoading(true)

    const formData = new FormData()

    formData.append('content', content)
    formData.append('tags', JSON.stringify(selectedTags))

    if (image) formData.append('image', image)

    const result = await dispatch(createPost(formData))
    if (createPost.fulfilled.match(result)) {
      setContent('')
      setImage(null)

      setImagePreview('')
      setSuggestedTags([])
      setSelectedTags([])
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

          {selectedTags.length > 0 && (

            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"

                  onClick={() => removeSelectedTag(tag)}
                  className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-200"
                  title="Remove tag"

                >
                  #{tag} <span className="ml-1">x</span>
                </button>
              ))}
            </div>
          )}

          {suggestedTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">

              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addSelectedTag(tag)}

                  className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full hover:bg-blue-100"
                >
                  #{tag}
                </button>
              ))}
            </div>

          )}

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
                onClick={handleImproveWithAI}
                disabled={aiLoading || !content.trim()}

                title="Improve with AI"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {aiLoading ? (
                  <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                )}
                Improve

              </button>

              <button
                type="button"
                onClick={handleSuggestTags}
                disabled={aiLoading || !content.trim()}

                title="Suggest tags"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fa-solid fa-tags text-xs" />

                Suggest tags
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

