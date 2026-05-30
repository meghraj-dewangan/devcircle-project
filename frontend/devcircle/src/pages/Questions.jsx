
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchQuestions, clearQuestions } from '../features/questions/questionSlice'
import QuestionCard from '../components/questions/QuestionCard'
import Loader from '../components/shared/Loader'
import EmptyState from '../components/shared/EmptyState'
import Button from '../components/shared/Button'

const Questions = () => {

  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  const tag = searchParams.get('tag') || ''
  const { questions, loading, hasMore, page } = useSelector((state) => state.questions)

  useEffect(() => {
    dispatch(clearQuestions())

    dispatch(fetchQuestions({ page: 1, tag }))
  }, [dispatch, tag])

  const loadMore = () => {
    dispatch(fetchQuestions({ page: page + 1, tag }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">

        <h2 className="text-lg font-semibold text-gray-900">

          {tag ? `#${tag}` : 'Questions'}
        </h2>
        <Link to="/ask">
          <Button>Ask Question</Button>

        </Link>
      </div>

      {loading && questions.length === 0 ? (
        <Loader />
      ) : questions.length === 0 ? (
        <EmptyState message="No questions found. Be the first to ask!" />
      ) : (
        <div className="flex flex-col gap-3">

          {questions.map((q) => (
            <QuestionCard key={q._id} question={q} />

          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-6">

          <Button variant="outline" onClick={loadMore} disabled={loading}>
            
            {loading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Questions
