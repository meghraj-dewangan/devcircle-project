import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearPosts, fetchFeed, fetchExplorePosts } from '../../features/posts/postSlice'
import PostCard from './PostCard'
import Loader from '../shared/Loader'
import EmptyState from '../shared/EmptyState'
import Button from '../shared/Button'

const PostFeed = ({ mode = 'feed' }) => {

  const dispatch = useDispatch()
  const { posts, loading, error, hasMore, page } = useSelector((state) => state.posts)
  const { user, token } = useSelector((state) => state.auth)

 
  const activeMode = mode === 'feed' && (!user || !token) ? 'explore' : mode

  useEffect(() => {

    dispatch(clearPosts())

    if (activeMode === 'feed') {
      dispatch(fetchFeed(1))
    } else {
      dispatch(fetchExplorePosts(1))

    }
  }, [dispatch, activeMode])

  const loadMore = () => {

    if (activeMode === 'feed') {
      dispatch(fetchFeed(page + 1))

    } else {
      dispatch(fetchExplorePosts(page + 1))
    }
  }

  if (loading && page === 1) return <Loader />

  if (error) return <p className="text-red-500 text-sm text-center py-4">{error}</p>
  if (!loading && posts.length === 0) {

    const msg = activeMode === 'feed'
      ? "You're not following anyone yet. Go to Explore to discover people."
      : 'No posts yet. Be the first to post!'
    return <EmptyState message={msg} />

  }

  return (
    <div className="flex flex-col gap-3">

      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {hasMore && (
        <div className="flex justify-center py-4">

          <Button onClick={loadMore} variant="outline" disabled={loading}>
            
            {loading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default PostFeed

