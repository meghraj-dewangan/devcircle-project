
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosfetch from '../api/axios'
import Avatar from '../components/shared/Avatar'
import Loader from '../components/shared/Loader'

const BACKEND = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const getImageSrc = (imagePath) => {

  if (!imagePath) return ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath

  if (imagePath.startsWith('/uploads')) return `${BACKEND}${imagePath}`
  if (imagePath.startsWith('uploads/')) return `${BACKEND}/${imagePath}`
  return `${BACKEND}/uploads/${imagePath}`
}

const Search = () => {
  const { user: currentUser } = useSelector((state) => state.auth)

  const [query, setQuery] = useState('')

  const [type, setType] = useState('all')
  const [results, setResults] = useState({ users: [], posts: [], questions: [] })

  const [loading, setLoading] = useState(false)
  const [followMap, setFollowMap] = useState({})

  const [followLoading, setFollowLoading] = useState({})

  const debounceRef = useRef(null)
  const latestRequestRef = useRef(0)

  const fetchFollowStatuses = async (users) => {

    if (!currentUser || !users.length) return

    const ids = users.map((u) => u._id).join(',')
    try {
      const { data } = await axiosfetch.get(`/follow/status-bulk?ids=${ids}`)
      setFollowMap((prev) => ({ ...prev, ...data }))
    } catch {
      return
    }
  }

  const runSearch = async (searchType, searchQuery = query) => {

    const requestId = Date.now()
    latestRequestRef.current = requestId

    setLoading(true)

    try {
      const params = { type: searchType }

      if (searchQuery.trim()) params.q = searchQuery.trim()

      const { data } = await axiosfetch.get('/search', { params })

      
      if (latestRequestRef.current !== requestId) return

      const normalized = {
        users: data.users || [],
        posts: data.posts || [],

        questions: data.questions || [],
      }

      setResults(normalized)

      const otherUsers = normalized.users.filter((u) => u._id !== currentUser?._id)

      if (otherUsers.length) {
        fetchFollowStatuses(otherUsers)
      }
    } catch {
      if (latestRequestRef.current !== requestId) return

      setResults({ users: [], posts: [], questions: [] })
      return
    } finally {
      if (latestRequestRef.current === requestId) {
        setLoading(false)
      }
    }
  }

  
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      runSearch(type, query)

    }, 300)

    return () => {
      if (debounceRef.current) {

        clearTimeout(debounceRef.current)
      }
    }
  }, [query, type])

  const handleSearch = async (e) => {

    e.preventDefault()

   
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    await runSearch(type, query)
  }

  const handleFollowToggle = async (e, userId) => {
    e.preventDefault()

    e.stopPropagation()

    if (!currentUser) return

    const isFollowing = followMap[userId]

    setFollowLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      if (isFollowing) {
        await axiosfetch.delete(`/follow/${userId}`)

        setFollowMap((prev) => ({ ...prev, [userId]: false }))
      } else {

        await axiosfetch.post(`/follow/${userId}`)
        setFollowMap((prev) => ({ ...prev, [userId]: true }))
      }

    } catch {

      return
    } finally {

      setFollowLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const otherUsers = (results.users || []).filter((u) => u._id !== currentUser?._id)

  const isEmpty =!otherUsers.length && !(results.posts || []).length && !(results.questions || []).length
    
    
    

  return (

    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, posts, questions..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-600"
        >
          Search

        </button>
      </form>

     
      <div className="flex gap-2 mb-5">
        {['all', 'users', 'posts', 'questions'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}

            className={`text-xs px-3 py-1.5 rounded-full border ${
              type === t
                ? 'bg-blue-500 text-white border-blue-500'
                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}

          </button>

        ))}
      </div>

      {loading && <Loader />}

      {!loading && (
        <div className="flex flex-col gap-6">

          {/* Users section */}
          {(type === 'all' || type === 'users') && otherUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">

                <i className="fa-solid fa-users mr-2 text-gray-400" />
                Users
              </h3>

              <div className="flex flex-col gap-2">

                {otherUsers.map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:bg-gray-50"
                  >
                    <Avatar src={u.avatar} username={u.username} size="md" />

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-medium text-gray-900">{u.username}</p>
                      {u.bio && <p className="text-xs text-gray-500 line-clamp-1">{u.bio}</p>}

                    </div>
                    {currentUser && (
                      <button
                        onClick={(e) => handleFollowToggle(e, u._id)}
                        disabled={followLoading[u._id]}
                        className={`ml-2 text-xs px-3 py-1.5 rounded-full border font-medium shrink-0 transition-colors ${
                          followMap[u._id]
                            ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-300'
                            : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                        } disabled:opacity-50`}
                      >

                        {followLoading[u._id]
                          ? '...'
                          : followMap[u._id]
                            ? 'Following'
                            : 'Follow'}
                      </button>

                    )}
                  </Link>
                ))}
              </div>

            </div>
          )}

          {/* Posts section */}
          {(type === 'all' || type === 'posts') && (results.posts || []).length > 0 && (
            <div>

              <h3 className="text-sm font-semibold text-gray-700 mb-3">

                <i className="fa-solid fa-file-lines mr-2 text-gray-400" />
                Posts
              </h3>
              <div className="flex flex-col gap-2">

                {(results.posts || []).map((p) => (
                  <div
                    key={p._id}
                    className="bg-white border border-gray-200 rounded-xl p-3 hover:bg-gray-50 flex gap-3 items-start"
                  >
                    <Link to={`/profile/${p.author?.username}`} className="shrink-0">
                      <Avatar src={p.author?.avatar} username={p.author?.username} size="sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${p.author?.username}`}
                        className="text-xs font-medium text-gray-800 mb-1 inline-block hover:text-blue-600"
                      >
                        {p.author?.username}
                      </Link>
                      <p className="text-sm text-gray-700 line-clamp-2">{p.content}</p>
                      {p.image && (
                        <img
                          src={getImageSrc(p.image)}
                          alt="post"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                          className="mt-2 w-full max-h-40 object-contain rounded-lg bg-gray-50"
                        />
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Questions section */}
          {(type === 'all' || type === 'questions') && (results.questions || []).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">

                <i className="fa-solid fa-circle-question mr-2 text-gray-400" />
                Questions
              </h3>

              <div className="flex flex-col gap-2">

                {(results.questions || []).map((q) => (
                  <Link
                    key={q._id}
                    to={`/questions/${q._id}`}

                    className="bg-white border border-gray-200 rounded-xl p-3 hover:bg-gray-50 flex gap-3 items-start"
                  >
                    <Avatar src={q.author?.avatar} username={q.author?.username} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 mb-1">{q.author?.username}</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{q.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">

                        {q.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>

                        ))}

                        {q.isResolved && (
                          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                            Solved
                          </span>
                          
                        )}
                      </div>
                    </div>

                  </Link>
                ))}
              </div>

            </div>
          )}

          {isEmpty && (
            <p className="text-sm text-gray-400 text-center py-8">No results found</p>
            
          )}
        </div>
      )}
    </div>
  )
}

export default Search
