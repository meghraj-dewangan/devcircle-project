import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import postReducer from '../features/posts/postSlice'
import questionReducer from '../features/questions/questionSlice'

import userReducer from '../features/users/userSlice'
import messageReducer from '../features/messages/messageSlice'

const store = configureStore({

  reducer: {
    auth: authReducer,
    posts: postReducer,
    questions: questionReducer,
    users: userReducer,
    messages: messageReducer,
  },
  
})

export default store
