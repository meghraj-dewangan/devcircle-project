import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosfetch from '../../api/axios'

const RightSidebar = () => {
  const [popularTags, setPopularTags] = useState([])

  useEffect(() => {
    let alive = true

    axiosfetch.get('/questions/tags')
      .then(({ data }) => {
        if (!alive) return

        const list = Array.isArray(data)
          ? data
              .map((item) => {
                if (typeof item === 'string') {
                  return { tag: item, postCount: 0 }
                }

                return {
                  tag: item?.tag,
                  postCount: Number(item?.postCount) || 0,
                }
              })
              .filter((item) => item.tag)
          : []

        setPopularTags(list)
      })
      .catch(() => {
        if (!alive) return

        setPopularTags([])
      })

    return () => {
      alive = false
    }
  }, [])

  return (
    <aside className="hidden xl:block w-60 sticky top-16 h-fit">
      {/* Popular Tags */}

      {popularTags.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Tags</h3>
          
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 8).map((tag) => (
              <Link
                key={tag.tag}
                to={`/questions?tag=${encodeURIComponent(tag.tag)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>#{tag.tag}</span>
                <span className="text-[10px] text-gray-400">
                  {tag.postCount > 0 ? `${tag.postCount} posts` : '0 posts'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

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
