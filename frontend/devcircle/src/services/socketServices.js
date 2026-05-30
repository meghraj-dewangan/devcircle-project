import { io } from 'socket.io-client'

let socket = null

export const connectSocket = (token) => {

  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
  })

  return socket

}

export const getSocket = () => socket

export const disconnectSocket = () => {
    
  socket?.disconnect()
  socket = null
}
