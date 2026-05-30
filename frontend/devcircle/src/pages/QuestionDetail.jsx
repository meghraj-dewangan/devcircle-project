
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchQuestionById, deleteQuestion, updateQuestion } from '../features/questions/questionSlice'
import api from '../api/axios'

import AnswerCard from '../components/questions/AnswerCard'
import Loader from '../components/shared/Loader'
import ErrorMessage from '../components/shared/ErrorMessage'
import Button from '../components/shared/Button'

import Avatar from '../components/shared/Avatar'

const QuestionDetail = () => {
  const { id } = useParams()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const { currentQuestion, loading, error } = useSelector((state) => state.questions)

  const [answers, setAnswers] = useState([])
  const [answerBody, setAnswerBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [changedVotes, setChangedVotes] = useState(null)

  // edit -delete state
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {

    dispatch(fetchQuestionById(id))

    api.get(`/questions/${id}/answers`).then(({ data }) => setAnswers(data))

  }, [dispatch, id])

  const isOwner = user && currentQuestion && user._id === currentQuestion.author?._id

  const handleDelete = async () => {

    if (!window.confirm('Are you sure you want to delete this question?')) return
    setDeleteLoading(true)

    const result = await dispatch(deleteQuestion(id))

    if (deleteQuestion.fulfilled.match(result)) {
      navigate('/questions', { replace: true })
    }
    setDeleteLoading(false)

  }

  const handleStartEdit = () => {
    if (!currentQuestion) return
    setEditTitle(currentQuestion.title)

    setEditBody(currentQuestion.body)

    setEditTags((currentQuestion.tags || []).join(', '))
    setIsEditing(true)
  }

  const handleSaveEdit = async (e) => {

    e.preventDefault()
    if (!editTitle.trim() || !editBody.trim()) return
    setEditLoading(true)

    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const result = await dispatch(updateQuestion({ id, title: editTitle, body: editBody, tags: tagsArray }))
    if (updateQuestion.fulfilled.match(result)) {

      setIsEditing(false)
    }
    setEditLoading(false)
  }

  const handleSubmitAnswer = async (e) => {

    e.preventDefault()
    if (!answerBody.trim()) return
    setSubmitting(true)
    try {

      const { data } = await api.post(`/questions/${id}/answers`, { body: answerBody })
      setAnswers([...answers, data])
      setAnswerBody('')
    } catch {

      // silently skip
    } finally {
      setSubmitting(false)
    }
  }

  const handleAccept = async (answerId) => {

    try {

      await api.put(`/answers/${answerId}/accept`)
      const updated = answers
        .map((a) => ({

          ...a,
          isAccepted: a._id === answerId,
        }))
        .sort((a, b) => {

          if (a.isAccepted && !b.isAccepted) return -1
          if (!a.isAccepted && b.isAccepted) return 1
          return 0
        })

      setAnswers(updated)
      dispatch(fetchQuestionById(id))

    } catch {
      // silently skip
    }
  }

  const handleVoteQuestion = async (voteType) => {

    if (!user) return
    try {
      const { data } = await api.post(`/questions/${id}/vote`, { voteType })
      setChangedVotes({
        questionId: currentQuestion?._id,
        upvotes: data.upvotes,
        downvotes: data.downvotes,
      })
    } catch {

      // silently skip
    }
  }

  if (loading) return <Loader />

  if (error) return <ErrorMessage message={error} />
  if (!currentQuestion) return null

  const q = currentQuestion
  const questionVotes = changedVotes?.questionId === q._id
    ? changedVotes
    : { upvotes: q.upvotes || 0, downvotes: q.downvotes || 0 }

  return (

    <div className="flex flex-col gap-4">
     
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">

          <Avatar src={q.author?.avatar} username={q.author?.username} size="sm" />
          <p className="text-sm text-gray-600">{q.author?.username}</p>
          {q.isResolved && (

            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Solved
            </span>
          )}

          {/* Owner actions */}
          {isOwner && !isEditing && (
            <div className="ml-auto flex items-center gap-2">

              <button
                onClick={handleStartEdit}
                className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50"
              >
                <i className="fa-solid fa-pen mr-1" />
                Edit
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 disabled:opacity-40"
              >

                {deleteLoading ? 'Deleting...' : <><i className="fa-solid fa-trash mr-1" />Delete</>}
              </button>

            </div>

          )}
        </div>

       
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Question title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />

            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={5}
              placeholder="Question details..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            />

            <input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

            </div>

          </form>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{q.title}</h1>

            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{q.body}</p>
            {q.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {q.tags.map((t) => (
                  <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    #{t}
                  </span>
                ))}

              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">

              <button
                onClick={() => handleVoteQuestion('up')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600"
              >
                <i className="fa-regular fa-thumbs-up" />
                <span>{questionVotes.upvotes}</span>
              </button>

              <button
                onClick={() => handleVoteQuestion('down')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500"
              >

                <i className="fa-regular fa-thumbs-down" />
                <span>{questionVotes.downvotes}</span>
              </button>

            </div>
          </>
        )}
      </div>

      {/* Answers */}
      <h2 className="text-sm font-semibold text-gray-700">
        {answers.length} Answer{answers.length !== 1 ? 's' : ''}
      </h2>

      {answers.map((a) => (

        <AnswerCard
          key={a._id}
          answer={a}
          questionAuthorId={q.author?._id}
          onAccept={handleAccept}
        />

      ))}

     {/* answer form */}
      {user && (
        <form onSubmit={handleSubmitAnswer} className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Answer</h3>

          <textarea
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            rows={5}
            placeholder="Write your answer here..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none mb-3"
          />
          
          <Button type="submit" disabled={submitting}>

            {submitting ? 'Posting...' : 'Post Answer'}
          </Button>

        </form>

      )}

    </div>
  )
}

export default QuestionDetail
