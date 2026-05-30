
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, clearError } from '../features/auth/authSlice'
import Button from '../components/shared/Button'
import ErrorMessage from '../components/shared/ErrorMessage'

const Login = () => {
  const dispatch = useDispatch()

  const navigate = useNavigate()
  const { loading, error, user } = useSelector((state) => state.auth)


  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {

    if (user) navigate('/')
    return () => dispatch(clearError())

  }, [user, navigate, dispatch])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {

    e.preventDefault()
    dispatch(loginUser(form))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Log in to DevCircle</p>


        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />

          </div>
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />

          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>

        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          No account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>

        </p>
      </div>
      
    </div>
  )
}

export default Login
