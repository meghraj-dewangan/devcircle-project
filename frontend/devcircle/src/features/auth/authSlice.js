import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosfetch from '../../api/axios';


const storedUser = localStorage.getItem('user')

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {

    try {

      const { data } = await axiosfetch.post('/auth/register', formData)

      localStorage.setItem('token', data.token)

      localStorage.setItem('user', JSON.stringify(data.user))
      return data

    } catch (error) {
      const res = error.response?.data
      const msg = res?.message || res?.errors?.[0]?.msg || 'Registration failed'

      return rejectWithValue(msg)
    }
  }
)

export const loginUser = createAsyncThunk(

  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.post('/auth/login', formData)

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error) {
      const res = error.response?.data
      const msg = res?.message || res?.errors?.[0]?.msg || 'Login failed'

      return rejectWithValue(msg)
    }
  }
)

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {

    try {
      const { data } = await axiosfetch.get('/auth/me')
      return data

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user')
    }
  }
)

const authSlice = createSlice({

  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },

  reducers: {

    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    clearError: (state) => {
      state.error = null
    },

  },

  extraReducers: (builder) => {

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
