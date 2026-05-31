import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosfetch from '../../api/axios'

export const fetchConversations = createAsyncThunk(

  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {

      const { data } = await axiosfetch.get('/messages/conversations')
      return data

    } catch (error) {

      return rejectWithValue(error.response?.data?.message || 'Failed to load conversations')
    }
  }
)

export const fetchMessages = createAsyncThunk(

  'messages/fetchMessages',
  async (userId, { rejectWithValue }) => {
    try {

      const { data } = await axiosfetch.get(`/messages/${userId}`)
      return data

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load messages')
    }
  }
)

export const sendMessage = createAsyncThunk(

  'messages/sendMessage',
  async ({ userId, content }, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.post(`/messages/${userId}`, { content })
      return data

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

const messageSlice = createSlice({

  name: 'messages',
  initialState: {

    conversations: [],
    messages: [],
    loading: false,
    error: null,
    activeUserId: null,
    onlineUserIds: [],
  },

  reducers: {

    setActiveUser: (state, action) => {

      state.activeUserId = action.payload
    },
    
    addRealtimeMessage: (state, action) => {

      const msg = action.payload

      const senderId = msg.sender?._id || msg.sender
      
      if (senderId && state.activeUserId &&
          (senderId === state.activeUserId || senderId?.toString() === state.activeUserId)) {
        state.messages.push(msg)
      }
     
      const otherUser = msg.sender

      if (otherUser) {

        const otherId = otherUser._id || otherUser

        const isActive = otherId === state.activeUserId || otherId?.toString() === state.activeUserId
        const idx = state.conversations.findIndex(
          (c) => c.user._id === otherId || c.user._id?.toString() === otherId?.toString()
        )

        if (idx >= 0) {
          state.conversations[idx].lastMessage = msg.content
          if (!isActive) {
            state.conversations[idx].unreadCount = (state.conversations[idx].unreadCount || 0) + 1

          }
        } else {

          state.conversations.unshift({

            user: typeof otherUser === 'object' ? otherUser : { _id: otherUser },
            lastMessage: msg.content,
            unreadCount: isActive ? 0 : 1,

          })
        }
      }
    },

    clearMessages: (state) => {

      state.messages = []
    },
    setOnlineUsers: (state, action) => {

      const ids = Array.isArray(action.payload) ? action.payload : []
      state.onlineUserIds = ids.map((id) => id?.toString()).filter(Boolean)
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {

        state.loading = true

      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false

        state.conversations = action.payload
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false

        state.error = action.payload

      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true

      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false

        state.messages = action.payload
     
        const userId = action.meta.arg

        const idx = state.conversations.findIndex(
          (c) => c.user._id === userId || c.user._id?.toString() === userId
        )
        if (idx >= 0) {
          state.conversations[idx].unreadCount = 0
        }

      })
      .addCase(fetchMessages.rejected, (state, action) => {

        state.loading = false
        state.error = action.payload

      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload)
      
        const msg = action.payload

        const otherUser = msg.receiver

        if (otherUser) {

          const idx = state.conversations.findIndex(
            (c) => c.user._id === otherUser._id || c.user._id === otherUser

          )

          if (idx >= 0) {
            state.conversations[idx].lastMessage = msg.content
          } else {

            state.conversations.unshift({
              user: otherUser,
              lastMessage: msg.content,
              unreadCount: 0,

            })
            
          }
        }
        
      })
  },
})

export const { addRealtimeMessage, clearMessages, setActiveUser, setOnlineUsers } = messageSlice.actions
export default messageSlice.reducer
