
import { useLocation, useNavigate } from 'react-router-dom'
import PostForm from '../components/posts/PostForm'
import PostFeed from '../components/posts/PostFeed'

const Home = () => {

  const location = useLocation()
  const navigate = useNavigate()


  const tab = location.pathname === '/explore' ? 'explore' : 'feed'

  return (

    <div>

     
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => navigate('/')}
          className={`flex-1 text-sm font-medium py-3 ${
            tab === 'feed'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}

        >
          My Feed
        </button>

        <button
          onClick={() => navigate('/explore')}
          className={`flex-1 text-sm font-medium py-3 ${
            tab === 'explore'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >

          Explore
        </button>
        
      </div>

     
      {tab === 'feed' && <PostForm />}

      {/* Post list */}
      <PostFeed mode={tab === 'feed' ? 'feed' : 'explore'} />
    </div>
  )
}

export default Home
