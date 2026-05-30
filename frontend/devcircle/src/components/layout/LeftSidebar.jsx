import { Link, NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Avatar from '../shared/Avatar'

const LeftSidebar = () => {

  const { user } = useSelector((state) => state.auth)
  const { conversations } = useSelector((state) => state.messages)

  const unreadCount = conversations.reduce((count, conversation) => {
    return count + (conversation.unreadCount || 0)
  }, 0)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-600 font-medium': 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        
    }`

  return (
    <aside className="hidden lg:flex flex-col gap-0.5 w-56 sticky top-16 h-fit">

     
      {user && (
        <Link
          to={`/profile/${user.username}`}
          className="flex items-center gap-3 px-3 py-3 mb-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Avatar src={user.avatar} username={user.username} size="md" />

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>

            <p className="text-xs text-gray-400 truncate">{user.bio || 'No bio yet'}</p>
          </div>
        </Link>
      )}

      <NavLink to="/" end className={linkClass}>

        <i className="fa-solid fa-house w-4 text-center" />
        Feed
      </NavLink>

      <NavLink to="/explore" className={linkClass}>

        <i className="fa-solid fa-compass w-4 text-center" />
        Explore
      </NavLink>
      <NavLink to="/questions" className={linkClass}>

        <i className="fa-solid fa-circle-question w-4 text-center" />
        Q&amp;A
      </NavLink>
      <NavLink to="/ask" className={linkClass}>
        <i className="fa-solid fa-pen-to-square w-4 text-center" />
        Ask Question
      </NavLink>

      <NavLink to="/search" className={linkClass}>
        <i className="fa-solid fa-magnifying-glass w-4 text-center" />
        Search
      </NavLink>

      <NavLink to="/messages" className={linkClass}>
        <i className="fa-regular fa-comment-dots w-4 text-center" />
        <span className="flex-1">Messages</span>
        {unreadCount > 0 && (
          <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px]  font-semibold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </NavLink>

      {user && (
        <NavLink to={`/profile/${user.username}`} className={linkClass}>
          <i className="fa-solid fa-user w-4 text-center" />
          Profile
        </NavLink>
        
      )}

    </aside>
  )
}

export default LeftSidebar
