import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosfetch from '../../api/axios'
import { createPost, deletePost, repostPost } from '../posts/postSlice'

export const fetchUserProfile = createAsyncThunk(

  'users/fetchProfile',
  async (username, { rejectWithValue }) => {

    try {
      const { data } = await axiosfetch.get(`/users/${username}`)
      return data

    } catch (error) {

      return rejectWithValue(error.response?.data?.message || 'User not found')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'users/updateProfile',

  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.put('/users/profile', formData)
      return data

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const uploadAvatar = createAsyncThunk(
  'users/uploadAvatar',

  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.post('/users/avatar', formData)
      return data

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar')
    }
  }
)

export const checkFollowStatus = createAsyncThunk(
  'users/checkFollow',
  async (userId, { rejectWithValue }) => {
    try {

      const { data } = await axiosfetch.get(`/follow/${userId}/status`)
      return data.isFollowing
    } catch {

      return rejectWithValue(false)
    }
  }
)

export const followUser = createAsyncThunk(
  'users/follow',
  async (userId, { rejectWithValue }) => {
    try {

      await axiosfetch.post(`/follow/${userId}`)
      return true
    } catch (error) {

      return rejectWithValue(error.response?.data?.message || 'Failed to follow')
    }
  }
)

export const unfollowUser = createAsyncThunk(
  'users/unfollow',
  async (userId, { rejectWithValue }) => {
    try {

      await axiosfetch.delete(`/follow/${userId}`)
      return false

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow')

    }
  }
)

const userSlice = createSlice({
  name: 'users',
  initialState: {

    profile: null,
    isFollowing: false,
    loading: false,
    error: null,

  },
  reducers: {
    clearProfile: (state) => {

      state.profile = null
      state.isFollowing = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false

        state.error = action.payload
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.profile) state.profile.avatar = action.payload.avatar

      })
      .addCase(createPost.fulfilled, (state, action) => {
        if (state.profile && state.profile._id === action.payload.author?._id) {
          state.profile.posts = [action.payload, ...(state.profile.posts || [])]
        }
      })
      .addCase(repostPost.fulfilled, (state, action) => {
        if (state.profile && state.profile._id === action.payload.author?._id) {
          const exists = state.profile.posts?.some((post) => post._id === action.payload._id)
          if (!exists) {
            state.profile.posts = [action.payload, ...(state.profile.posts || [])]
          }
        }
      })
      .addCase(checkFollowStatus.fulfilled, (state, action) => {
        state.isFollowing = action.payload

      })
      .addCase(followUser.fulfilled, (state) => {

        state.isFollowing = true
        if (state.profile) state.profile.followerCount += 1

      })
      .addCase(unfollowUser.fulfilled, (state) => {
        state.isFollowing = false
        if (state.profile)
          state.profile.followerCount = Math.max(0, state.profile.followerCount - 1)

      })
      .addCase(deletePost.fulfilled, (state, action) => {
        if (!state.profile?.posts?.length) return

        state.profile.posts = state.profile.posts.filter((post) => post._id !== action.payload)
      })
      
  },
})

export const { clearProfile } = userSlice.actions
export default userSlice.reducer
