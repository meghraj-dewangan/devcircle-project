import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getMe } from './features/auth/authSlice'

import { addRealtimeMessage, setOnlineUsers } from './features/messages/messageSlice'
import { connectSocket, disconnectSocket } from './services/socketServices'
import Navbar from './components/layout/Navbar'
import LeftSidebar from './components/layout/LeftSidebar'
import RightSidebar from './components/layout/RightSidebar'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'

import Questions from './pages/Questions'
import QuestionDetail from './pages/QuestionDetail'
import AskQuestion from './pages/AskQuestion'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'

import Search from './pages/Search'
import Messages from './pages/Messages'

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth)

  if (!user) return <Navigate to="/login" replace />
  return children
}

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />

    <div className="max-w-6xl mx-auto flex gap-6 px-4 py-4">
      <LeftSidebar />
      <main className="flex-1 min-w-0 flex flex-col gap-4">{children}</main>
      <RightSidebar />

    </div>
  </div>
)

const App = () => {

  const dispatch = useDispatch()
  const { token, user } = useSelector((state) => state.auth)

 
  useEffect(() => {
    if (token) {
      dispatch(getMe())
    }
  }, [])

  // Global socket connect when logged in, disconnect on logout
  useEffect(() => {
    if (!token || !user) {

      disconnectSocket()
      dispatch(setOnlineUsers([]))
      return
    }

    const socket = connectSocket(token)

    socket.on('connect', () => {
      socket.emit('user_online', user._id)
    })

    socket.on('receive_message', (msg) => {

      dispatch(addRealtimeMessage(msg))
    })

    socket.on('online_users', (onlineUserIds) => {

      dispatch(setOnlineUsers(onlineUserIds))
    })

    return () => {
      socket.off('receive_message')

      socket.off('online_users')
      socket.off('connect')
    }
  }, [token, user?._id])

  return (

    <Routes>
     
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

    
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/explore"
        element={
          <MainLayout>
            <Home />

          </MainLayout>

        }
      />

      <Route
        path="/posts/:id"
        element={
          <MainLayout>
            <PostDetail />

          </MainLayout>
        }
      />

      <Route
        path="/questions"
        element={
          <MainLayout>
            <Questions />

          </MainLayout>
        }

      />
      <Route
        path="/questions/:id"
        element={

          <MainLayout>
            <QuestionDetail />
          </MainLayout>
        }
      />

      <Route
        path="/ask"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AskQuestion />

            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={

          <MainLayout>
            <Profile />

          </MainLayout>
        }
      />
      <Route
        path="/edit-profile"
        element={

          <ProtectedRoute>
            <MainLayout>
              <EditProfile />

            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <MainLayout>

            <Search />
          </MainLayout>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MainLayout>

              <Messages />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
