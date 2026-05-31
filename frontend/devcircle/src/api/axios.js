import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD
    ? 'https://devcircle-project.onrender.com/api'
    : 'http://localhost:5000/api');

const axiosfetch =  axios.create({
  baseURL: apiBaseUrl,
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
