import { useState } from 'react'
import { useSelector } from 'react-redux'
import axiosfetch from '../../api/axios'
import Avatar from '../shared/Avatar'

const AnswerCard = ({ answer, questionAuthorId, onAccept }) => {
  const { user } = useSelector((state) => state.auth)

  const [votes, setVotes] = useState({

    upvotes: answer.upvotes,
    downvotes: answer.downvotes,
  })

  const handleVote = async (voteType) => {

    if (!user) return
    try {
        
      const { data } = await axiosfetch.post(`/answers/${answer._id}/vote`, { voteType })
      setVotes({ upvotes: data.upvotes, downvotes: data.downvotes })
    } catch {
      // silently skip
    }
  }

  const isQuestionOwner = user && user._id === questionAuthorId?.toString()

  return (
    <div

      className={`bg-white border rounded-xl p-4 ${

        answer.isAccepted ? 'border-green-400' : 'border-gray-200'
      }`}
    >
      {answer.isAccepted && (

        <p className="text-xs text-green-600 font-medium mb-2">Accepted Answer</p>

      )}

      
      <div className="flex items-center gap-2 mb-3">

        <Avatar src={answer.author?.avatar} username={answer.author?.username} size="sm" />

        <div>
          <p className="text-sm font-medium text-gray-900">{answer.author?.username}</p>

          <p className="text-xs text-gray-400">
            {new Date(answer.createdAt).toLocaleDateString()}

          </p>
        </div>
      </div>

      
      <p className="text-sm text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">
        {answer.body}
      </p>

      {/* Vote buttons and accept */}
      <div className="flex items-center gap-3">

        <button
          onClick={() => handleVote('up')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600"
        >
          <i className="fa-regular fa-thumbs-up" />

          <span>{votes.upvotes}</span>
        </button>

        <button
          onClick={() => handleVote('down')}

          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500"
        >
          <i className="fa-regular fa-thumbs-down" />

          <span>{votes.downvotes}</span>
        </button>

        {isQuestionOwner && !answer.isAccepted && (
          <button
            onClick={() => onAccept(answer._id)}
            
            className="ml-auto text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-lg hover:bg-green-100"
          >
            Accept Answer
          </button>
        )}
      </div>
    </div>
  )
}

export default AnswerCard

