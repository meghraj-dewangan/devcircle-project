import axios from 'axios';

const axiosfetch =  axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})


axiosfetch.interceptors.request.use((config) => {

  const token = localStorage.getItem('token')
  if (token) {

    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


axiosfetch.interceptors.response.use(

  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      
    }
    return Promise.reject(error)
  }
)

export default axiosfetch;
