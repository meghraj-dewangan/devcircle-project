
import { Link } from 'react-router-dom'
import Avatar from '../shared/Avatar'

const QuestionCard = ({ question }) => {

  return (

    <div className="bg-white border border-gray-200 rounded-xl p-4">
     
      <div className="flex items-center gap-2 mb-3">

        <Link to={`/profile/${question.author?.username}`}>

          <Avatar src={question.author?.avatar} username={question.author?.username} size="sm" />
        </Link>
        <div className="flex-1">

          <Link
            to={`/profile/${question.author?.username}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            {question.author?.username}

          </Link>

          <p className="text-xs text-gray-400">
            {new Date(question.createdAt).toLocaleDateString()}

          </p>

        </div>
        {question.isResolved && (

          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Solved
          </span>
        )}

      </div>

      
      <Link to={`/questions/${question._id}`}>

        <h3 className="text-base font-medium text-gray-900 hover:text-blue-600 mb-2 leading-snug">

          {question.title}
        </h3>

      </Link>

   

      {question.tags && question.tags.length > 0 && (

        <div className="flex flex-wrap gap-1 mb-3">

          {question.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}

        </div>
      )}

     
      <div className="text-xs text-gray-500 flex items-center gap-3">
        <span>

          ?? {question.answerCount || 0} answer{question.answerCount !== 1 ? 's' : ''}
        </span>

        <span className="flex items-center gap-1">

          <i className="fa-regular fa-thumbs-up" />
          {question.upvotes || 0}

        </span>

        <span className="flex items-center gap-1">

          <i className="fa-regular fa-thumbs-down" />
          
          {question.downvotes || 0}
          
        </span>
      </div>
    </div>
  )
}

export default QuestionCard
