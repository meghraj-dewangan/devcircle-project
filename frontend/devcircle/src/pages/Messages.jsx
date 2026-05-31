
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setActiveUser } from '../features/messages/messageSlice'
import { getSocket } from '../services/socketServices'
import ChatList from '../components/messages/ChatList'

import { ChatBox } from '../components/messages/ChatBox'

const Messages = () => {

  const dispatch = useDispatch()

  const [selectedUser, setSelectedUser] = useState(null)
  const [showList, setShowList] = useState(true) 

  // Clear activeUser when leaving Messages page
  useEffect(() => {

    return () => { dispatch(setActiveUser(null)) }
  }, [dispatch])

  const handleSelectUser = (u) => {
    setSelectedUser(u)
    dispatch(setActiveUser(u._id))
    setShowList(false) 
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex h-[calc(100vh-120px)]">
    
      <div
        className={`w-full lg:w-80 border-r border-gray-200 overflow-y-auto flex-shrink-0 ${

          showList ? 'block' : 'hidden lg:block'
        }`}
      >
        <ChatList onSelectUser={handleSelectUser} />
      </div>

      {/* Right Chat box */}
      <div
        className={`flex-1 flex flex-col ${

          !showList ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {selectedUser ? (
          <>
           
            <button
              className="lg:hidden text-sm text-blue-500 px-4 pt-3 text-left hover:underline"
              onClick={() => setShowList(true)}
            >
              ← Back
            </button>

            <ChatBox otherUser={selectedUser} socket={getSocket()} />
          </>
        ) : (

          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Select a conversation to start message
          </div>
        )}

      </div>
    </div>

  )
}

export default Messages
