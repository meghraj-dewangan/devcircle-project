import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosfetch from '../../api/axios'

export const fetchFeed = createAsyncThunk(

  'posts/fetchFeed',
  async (page = 1, { rejectWithValue }) => {
    try {

      const { data } = await axiosfetch.get(`/posts?page=${page}`)
      return { ...data, page }
    } catch (error) {

      return rejectWithValue(error.response?.data?.message || 'Failed to load feed')
    }
  }
)

export const fetchExplorePosts = createAsyncThunk(

  'posts/fetchExplore',
  async (page = 1, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.get(`/posts/explore?page=${page}`)
      return { ...data, page }

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load posts')
    }
  }
)

export const createPost = createAsyncThunk(

  'posts/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.post('/posts', formData)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post')
    }
  }
)

export const deletePost = createAsyncThunk(

  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await axiosfetch.delete(`/posts/${postId}`)
      return postId

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post')
    }
  }
)

export const likePost = createAsyncThunk(

  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.post(`/posts/${postId}/like`)
      return { postId, ...data }

    } catch (error) {

      return rejectWithValue(error.response?.data?.message || 'Failed to like post')
    }
  }
)

export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async (postId, { rejectWithValue }) => {

    try {
      const { data } = await axiosfetch.delete(`/posts/${postId}/like`)
      return { postId, ...data }

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike post')
    }
  }
)

export const repostPost = createAsyncThunk(

  'posts/repostPost',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.post(`/posts/${postId}/repost`)

      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to repost')
    }
  }
)

const postSlice = createSlice({

  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
  },

  reducers: {
    clearPosts: (state) => {

      state.posts = []
      state.page = 1
      state.hasMore = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {

        state.loading = true
        state.error = null
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {

        state.loading = false
        if (action.payload.page === 1) {
          state.posts = action.payload.posts
        } else {
          state.posts = [...state.posts, ...action.payload.posts]

        }
        state.hasMore = action.payload.hasMore

        state.page = action.payload.page
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false

        state.error = action.payload
      })
      .addCase(fetchExplorePosts.pending, (state) => {
        state.loading = true

        state.error = null
      })
      .addCase(fetchExplorePosts.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.page === 1) {
          state.posts = action.payload.posts

        } else {
          state.posts = [...state.posts, ...action.payload.posts]
        }
        state.hasMore = action.payload.hasMore

        state.page = action.payload.page
      })
      .addCase(fetchExplorePosts.rejected, (state, action) => {
        state.loading = false

        state.error = action.payload
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts]

      })
      .addCase(repostPost.fulfilled, (state, action) => {

        state.posts = [action.payload, ...state.posts]
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload)
      })
      .addCase(likePost.fulfilled, (state, action) => {

        const post = state.posts.find((p) => p._id === action.payload.postId)

        if (post) post.likeCount = action.payload.likeCount
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        
        const post = state.posts.find((p) => p._id === action.payload.postId)
        if (post) post.likeCount = action.payload.likeCount
      })
  },
})

export const { clearPosts } = postSlice.actions
export default postSlice.reducer
