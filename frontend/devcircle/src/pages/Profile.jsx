
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile } from '../features/users/userSlice'
import { followUser, unfollowUser, checkFollowStatus } from '../features/users/userSlice'
import Avatar from '../components/shared/Avatar'
import Loader from '../components/shared/Loader'
import ErrorMessage from '../components/shared/ErrorMessage'
import PostCard from '../components/posts/PostCard'

import Button from '../components/shared/Button'

const Profile = () => {

  const { username } = useParams()
  const dispatch = useDispatch()

  const { profile, loading, error, isFollowing } = useSelector((state) => state.users)
  const { user } = useSelector((state) => state.auth)


  const isOwnProfile = user?.username === username

  useEffect(() => {

    dispatch(fetchUserProfile(username))
  }, [dispatch, username])

  useEffect(() => {

    if (profile && user && !isOwnProfile) {
      dispatch(checkFollowStatus(profile._id))
    }

  }, [profile, user, isOwnProfile, dispatch])

  const handleFollow = () => {

    if (isFollowing) {
      dispatch(unfollowUser(profile._id))
    } else {

      dispatch(followUser(profile._id))
    }
  }

  if (loading) return <Loader />

  if (error) return <ErrorMessage message={error} />

  if (!profile) return null

  return (
    <div className="flex flex-col gap-4">

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">

          <div className="flex items-center gap-4">

            <Avatar src={profile.avatar} username={profile.username} size="xl" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
              {profile.bio && (
                <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>

              )}
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{profile.followerCount || 0} Followers</span>
                <span>{profile.followingCount || 0} Following</span>

              </div>
            </div>
          </div>

          <div>
            {isOwnProfile ? (

              <Link to="/edit-profile">
                <Button variant="outline">Edit Profile</Button>

              </Link>
            ) : user ? (

              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                onClick={handleFollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}

              </Button>
            ) : null}
          </div>
        </div>

        {profile.skills?.length > 0 && (

          <div className="flex flex-wrap gap-2 mt-3">
            {profile.skills.map((s) => (

              <span key={s} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-4 mt-4 text-xs">

          {profile.githubLink && (
            <a
              href={profile.githubLink}

              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              GitHub
            </a>
          )}
          {profile.website && (

            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
                
              Website
            </a>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Posts</h2>
          <span className="text-xs text-gray-500">{profile.posts?.length || 0} posts</span>
        </div>

        {profile.posts?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {profile.posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  )
}

export default Profile
