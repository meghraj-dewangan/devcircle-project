import { useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { fetchConversations } from '../../features/messages/messageSlice'
import Avatar from '../shared/Avatar'

const Navbar = () => {

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const { user } = useSelector((state) => state.auth)
  const { conversations } = useSelector((state) => state.messages)

  useEffect(() => {

    if (user) {
      dispatch(fetchConversations())
    }

  }, [dispatch, user])

  const hasUnreadMessages = conversations.some((c) => (c.unreadCount || 0) > 0)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const navLink = ({ isActive }) =>
    `text-sm transition-colors ${
      isActive ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'
    }`

  return (

    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">

      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

       
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg">

          <i className="fa-solid fa-code text-blue-500" />
          DevCircle
        </Link>

       
       
        <nav className="hidden md:flex items-center gap-5">
          <NavLink to="/" end className={navLink}>Feed</NavLink>
          <NavLink to="/explore" className={navLink}>Explore</NavLink>
          <NavLink to="/questions" className={navLink}>Q&amp;A</NavLink>
          <NavLink to="/search" className={navLink}>Search</NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/messages"
                title="Messages"
                className="hidden md:flex items-center text-gray-500 hover:text-blue-600 relative"
              >
                <i className="fa-regular fa-comment-dots text-lg" />
                {hasUnreadMessages && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </Link>

              <Link to={`/profile/${user.username}`}>
                <Avatar src={user.avatar} username={user.username} size="sm" />
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="hidden md:flex items-center text-gray-400 hover:text-red-500"
              >
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>

          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600">
                Login
              </Link>
              
              <Link
                to="/register"
                className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600"
              >
                Sign up
              </Link>
              
            </>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar

