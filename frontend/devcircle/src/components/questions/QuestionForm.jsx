
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createQuestion } from '../../features/questions/questionSlice'
import axiosfetch from '../../api/axios'
import Button from '../shared/Button'
import ErrorMessage from '../shared/ErrorMessage'

const QuestionForm = () => {
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const [title, setTitle] = useState('')

  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const [error, setError] = useState('')
  const [aiStatus, setAiStatus] = useState('')

  const [vagueWarning, setVagueWarning] = useState('')
  const [clarityChecking, setClarityChecking] = useState(false)

  const cleanText = (text) => {
    const trimmed = text.replace(/\s+/g, ' ').trim()

    if (!trimmed) return ''
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  }

  const improveTitleLocally = (value) => {

    const cleaned = cleanText(value)
    if (!cleaned) return ''

    const map = {
      mern: 'MERN',
      api: 'API',
      jwt: 'JWT',
      sql: 'SQL',
      css: 'CSS',
      html: 'HTML',
      js: 'JavaScript',
      ts: 'TypeScript',
    }

    return cleaned
      .split(' ')
      .map((word) => {
        const key = word.toLowerCase()

        return map[key] || word
      })
      .join(' ')
  }

  const improveBodyLocally = (value) => {
    const cleaned = cleanText(value)
    if (!cleaned) return ''
    return cleaned.endsWith('.') ? cleaned : `${cleaned}.`
  }

  const generateBasicTags = (text) => {
    const lower = text.toLowerCase()

    const hintTags = []
    if (lower.includes('mern')) hintTags.push('mern', 'mongodb', 'express', 'react', 'nodejs')
    if (lower.includes('react')) hintTags.push('react')

    if (lower.includes('node')) hintTags.push('nodejs')
    if (lower.includes('express')) hintTags.push('express')

    if (lower.includes('mongo')) hintTags.push('mongodb')
    if (lower.includes('javascript') || lower.includes(' js ')) hintTags.push('javascript')
    if (lower.includes('typescript') || lower.includes(' ts ')) hintTags.push('typescript')

    if (lower.includes('api')) hintTags.push('api')

    const stopWords = [
      'this', 'that', 'with', 'from', 'have', 'what', 'when', 'where', 'why', 'how',
      'your', 'you', 'into', 'about', 'there', 'their', 'would', 'could', 'should',
      'error', 'issue', 'help', 'need', 'using', 'used', 'also', 'just', 'does',
      'will', 'been', 'than', 'then', 'them', 'they', 'and', 'for', 'the', 'are',
      'not', 'but', 'can', 'any', 'all', 'was', 'were', 'has', 'had', 'did', 'its',
      'http', 'https', 'www', 'com'
    ]

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(' ')
      .filter((w) => w.length > 2 && !stopWords.includes(w))

    const unique = [...new Set([...hintTags, ...words])]
    return unique.slice(0, 5)
  }

  const localVagueCheck = (questionTitle, questionBody) => {

    const t = questionTitle.trim()
    const b = questionBody.trim()

    const combinedWords = `${t} ${b}`.split(/\s+/).filter(Boolean)

    if (t.length < 8) {
      return { isVague: true, reason: 'Title is too short. Add a more specific title.' }

    }

    if (b.length < 30 || combinedWords.length < 12) {

      return { isVague: true, reason: 'Please add more details: context, expected result, and actual error.' }
    }

    return { isVague: false, reason: '' }
  }

  const handleImproveWithAI = async () => {
    if (!title.trim() || !body.trim()) return
    setAiLoading(true)
    setAiStatus('')
    try {
      const { data } = await axiosfetch.post('/ai/improve-question', { title, body })
      if (data.title) setTitle(data.title)

      if (data.body) setBody(data.body)
      setAiStatus('Improved.')
    } catch {
      setTitle(improveTitleLocally(title))

      setBody(improveBodyLocally(body))
      setAiStatus('Improved.')
    } finally {

      setAiLoading(false)
    }
  }

  const handleGenerateTags = async () => {

    if (!title.trim() && !body.trim()) return
    setAiLoading(true)

    setAiStatus('')
    try {
      const { data } = await axiosfetch.post('/ai/generate-tags', { content: `${title} ${body}` })
      const generated = Array.isArray(data.tags) ? data.tags : []
      if (generated.length > 0) {

        setTags(generated.join(', '))

        setAiStatus('Generated.')
      } else {
        const fallback = generateBasicTags(`${title} ${body}`)
        setTags(fallback.join(', '))
        setAiStatus('Generated.')
      }
    } catch {
      const fallback = generateBasicTags(`${title} ${body}`)
      setTags(fallback.join(', '))
      setAiStatus('Generated.')
    } finally {
      setAiLoading(false)
    }
  }

  const checkVagueQuestion = async () => {

    if (!title.trim() || !body.trim()) return { isVague: false, reason: '' }

    setClarityChecking(true)
    try {

      const { data } = await axiosfetch.post('/ai/detect-vague', { title, body })

      if (data?.isVague) {
        const reason = data.reason || 'Please add more detail before posting.'
        setVagueWarning(reason)
        setAiStatus('')
        return { isVague: true, reason }
      }
      setVagueWarning('')
      setAiStatus('Looks clear.')
      return { isVague: false, reason: '' }
    } catch {

      const localResult = localVagueCheck(title, body)

      if (localResult.isVague) {
        setVagueWarning(localResult.reason)
        setAiStatus('')
      } else {

        setVagueWarning('')
        setAiStatus('Looks clear.')
      }

      return localResult

    } finally {
      setClarityChecking(false)
    }

  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (!title.trim() || !body.trim()) {
      setError('Title and body are required')
      return
    }

    const vagueResult = await checkVagueQuestion()

    if (vagueResult.isVague) {

      const shouldContinue = window.confirm(
        `This question may be too vague: ${vagueResult.reason}\n\nDo you still want to post it?`
      )
      if (!shouldContinue) return
    }

    setLoading(true)

    const result = await dispatch(

      createQuestion({

        title,
        body,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
    )
    setLoading(false)

    if (createQuestion.fulfilled.match(result)) {

      navigate(`/questions/${result.payload._id}`)
    } else {
      setError(result.payload || 'Failed to post question')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ask a Question</h2>

      {error && <ErrorMessage message={error} />}
      {aiStatus && (
        <p className="mb-3 text-xs text-blue-600">{aiStatus}</p>

      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (aiStatus) setAiStatus('')
            if (vagueWarning) setVagueWarning('')
          }}
          placeholder="What is your question? Be specific."
          maxLength={200}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        />

      </div>

      <div className="mb-4">

        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={body}
          onChange={(e) => {

            setBody(e.target.value)
            if (aiStatus) setAiStatus('')
            if (vagueWarning) setVagueWarning('')

          }}
          placeholder="Describe your problem in detail. What have you tried? What error are you seeing?"
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
        />
      </div>


      <div className="mb-4">

        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>

        <input
          type="text"
          value={tags}
          onChange={(e) => {
            setTags(e.target.value)
            if (aiStatus) setAiStatus('')
          }}
          placeholder="react, nodejs, mongodb"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <p className="text-xs text-gray-400 mt-1">Comma separated</p>

      </div>

      {vagueWarning && (

        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <i className="fa-solid fa-triangle-exclamation mr-1" />
          This question may be unclear: {vagueWarning}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">

        <button
          type="button"
          onClick={handleImproveWithAI}
          disabled={aiLoading}
          className="text-xs text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 disabled:opacity-40"
        >
          {aiLoading ? '...' : 'Improve with AI'}
        </button>

        <button
          type="button"
          onClick={handleGenerateTags}
          disabled={aiLoading}
          className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-40"
        >
          {aiLoading ? '...' : 'Suggest tags'}
        </button>

        <button
          type="button"
          onClick={checkVagueQuestion}
          disabled={aiLoading || clarityChecking}
          className="text-xs text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 disabled:opacity-40"
        >

          {clarityChecking ? 'Checking...' : 'Check clarity'}
        </button>

      </div>

      <Button type="submit" disabled={loading}>
        
        {loading ? 'Posting...' : 'Post Question'}
      </Button>
    </form>
  )
}

export default QuestionForm
