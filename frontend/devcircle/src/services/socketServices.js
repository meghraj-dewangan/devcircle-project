import { io } from 'socket.io-client'

let socket = null

const socketBaseUrl = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.PROD
    ? 'https://devcircle-project.onrender.com'
    : 'http://localhost:5000');

export const connectSocket = (token) => {

  if (socket?.connected) return socket

  socket = io(socketBaseUrl, {
    auth: { token },
  })

  return socket

}

export const getSocket = () => socket

export const disconnectSocket = () => {
    
  socket?.disconnect()
  socket = null
}
