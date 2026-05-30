import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosfetch from '../../api/axios'

const FALLBACK_TAGS = ['react', 'nodejs', 'mongodb', 'javascript', 'python', 'css', 'express', 'git']

const RightSidebar = () => {
  const [popularTags, setPopularTags] = useState(FALLBACK_TAGS.map((t) => ({ tag: t })))

  useEffect(() => {
    axiosfetch.get('/questions/tags')
      .then(({ data }) => {
        if (data && data.length > 0) setPopularTags(data)
      })
      .catch(() => {/* use fallback */})
  }, [])

  return (
    <aside className="hidden xl:block w-60 sticky top-16 h-fit">
      {/* Popular Tags */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(({ tag }) => (
            <Link
              key={tag}
              to={`/questions?tag=${tag}`}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <Link to="/explore" className="hover:text-blue-600">Explore Posts</Link>
          <Link to="/questions" className="hover:text-blue-600">Browse Questions</Link>
          <Link to="/ask" className="hover:text-blue-600">Ask a Question</Link>
          <Link to="/search" className="hover:text-blue-600">Search</Link>
        </div>
      </div>
    </aside>
  )
}

export default RightSidebar

