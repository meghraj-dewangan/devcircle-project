import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  fetchMessages,
  sendMessage,
} from '../../features/messages/messageSlice'
import Avatar from '../shared/Avatar'

const ChatBox = ({ otherUser, socket }) => {

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const { messages, loading, onlineUserIds } = useSelector((state) => state.messages)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const isOtherUserOnline = onlineUserIds.includes(otherUser?._id?.toString())

  useEffect(() => {
    if (otherUser) {

      dispatch(fetchMessages(otherUser._id))
    }
  }, [dispatch, otherUser])

  // Scroll to the bottom when new messages arrive
  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {

    if (!text.trim() || !otherUser) return

    const result = await dispatch(

      sendMessage({ userId: otherUser._id, content: text })
    )

    // Also send  socket for real-time delivery to the other user
    if (sendMessage.fulfilled.match(result) && socket) {
      socket.emit('send_message', {

        receiverId: otherUser._id,
        ...result.payload,
      })
    }

    setText('')
  }

  return (
    <div className="flex flex-col h-full">
     
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">

        <Avatar src={otherUser?.avatar} username={otherUser?.username} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{otherUser?.username}</p>

          <p className={`text-[11px] ${isOtherUserOnline ? 'text-green-600' : 'text-gray-400'}`}>
            {isOtherUserOnline ? 'Online' : 'Offline'}

          </p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-4">Loading...</p>

        ) : (
          messages.map((msg, i) => {

            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id
             
            return (

              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                    isMe
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}

                >
                  {msg.content}
                </div>
              </div>

            )
          })
        )}
        <div ref={bottomRef} />

      </div>

   
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200">
        <input
          type="text"
          value={text}

          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}

          placeholder="Type a message..."
          className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-blue-400"
        />
        <button
          onClick={handleSend}

          disabled={!text.trim()}
          className="bg-blue-500 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-600 disabled:opacity-40"
        >
          Send
        </button>
        
      </div>
    </div>
  )
}

export { ChatBox }
export default ChatBox

