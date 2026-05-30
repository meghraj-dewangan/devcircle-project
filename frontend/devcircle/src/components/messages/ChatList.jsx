import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchConversations } from '../../features/messages/messageSlice'
import Avatar from '../shared/Avatar'
import Loader from '../shared/Loader'
import axiosfetch from '../../api/axios'

const ChatList = ({ onSelectUser }) => {
  const dispatch = useDispatch()

  const { conversations, loading, onlineUserIds } = useSelector((state) => state.messages)
  const [showSearch, setShowSearch] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchConversations())

  }, [dispatch])

  const handleSearchUsers = async (q) => {

    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }
    setSearchLoading(true)

    try {
      const { data } = await axiosfetch.get('/search', { params: { type: 'users', q: q.trim() } })
      setSearchResults(data.users || [])
    } catch {
      setSearchResults([])

    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectSearchUser = (u) => {
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
    onSelectUser(u)
  }

  if (loading && !conversations.length) return <Loader />

  return (
    <div className="flex flex-col h-full">

      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Messages</h2>

        <button
          onClick={() => { setShowSearch((v) => !v); setSearchQuery(''); setSearchResults([]) }}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          title="New message"
        >
          <i className="fa-solid fa-pen-to-square text-sm" />

        </button>
      </div>

      
      {showSearch && (
        <div className="border-b border-gray-200 p-3">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchUsers(e.target.value)}
            placeholder="Search users..."
            className="w-full text-sm border border-gray-300 rounded-full px-3 py-1.5 outline-none focus:border-blue-400"
          />

          {searchLoading && (
            <p className="text-xs text-gray-400 text-center py-2">Searching...</p>
          )}

          {!searchLoading && searchResults.map((u) => (
            <button
              key={u._id}
              onClick={() => handleSelectSearchUser(u)}
              className="flex items-center gap-2 w-full px-2 py-2 hover:bg-gray-50 rounded-lg mt-1 text-left"
            >

              <Avatar src={u.avatar} username={u.username} size="sm" />
              <span className="text-sm text-gray-800">{u.username}</span>
            </button>
          ))}

          {!searchLoading && searchQuery && !searchResults.length && (
            <p className="text-xs text-gray-400 text-center py-2">No users found</p>
          )}

        </div>
      )}

      {conversations.length === 0 && !showSearch ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8 px-4 text-center">
          <i className="fa-regular fa-comment-dots text-2xl text-gray-300" />
          <p className="text-sm text-gray-400">No conversations yet</p>
          <button
            onClick={() => setShowSearch(true)}
            className="text-xs text-blue-500 hover:underline mt-1"
          >
            Start a new message
          </button>

        </div>
      ) : (
        conversations.map((conv) => (

          <button
            key={conv.user._id}
            onClick={() => onSelectUser(conv.user)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
          >
            <div className="relative">

              <Avatar src={conv.user.avatar} username={conv.user.username} size="md" />
              {onlineUserIds.includes(conv.user._id?.toString()) && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{conv.user.username}</p>
                {conv.unreadCount > 0 && (
                  <span className="text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unreadCount}

                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] ${

                    onlineUserIds.includes(conv.user._id?.toString()) ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {onlineUserIds.includes(conv.user._id?.toString()) ? 'Online' : 'Offline'}
                </span>
                <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
              </div>
            </div>
            
          </button>
        ))
      )}
    </div>
  )
}

export default ChatList

