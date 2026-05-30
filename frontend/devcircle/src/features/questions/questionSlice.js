import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosfetch from '../../api/axios'

export const fetchQuestions = createAsyncThunk(

  'questions/fetchQuestions',

  async ({ page = 1, tag = '' } = {}, { rejectWithValue }) => {
    try {

      const url = tag ? `/questions?page=${page}&tag=${tag}` : `/questions?page=${page}`
      const { data } = await axiosfetch.get(url)

      return { ...data, page }
    } catch (error) {

      return rejectWithValue(error.response?.data?.message || 'Failed to load questions')
    }
  }
)

export const fetchQuestionById = createAsyncThunk(

  'questions/fetchById',
  async (id, { rejectWithValue }) => {

    try {

      const { data } = await axiosfetch.get(`/questions/${id}`)
      return data

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load question')
    }
  }
)

export const createQuestion = createAsyncThunk(

  'questions/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.post('/questions', formData)

      return data
    } catch (error) {

      const resData = error.response?.data
      
      if (resData?.errors?.length) {
        return rejectWithValue(resData.errors[0].msg)
      }
      return rejectWithValue(resData?.message || 'Failed to create question')
    }
  }
)

export const deleteQuestion = createAsyncThunk(
  'questions/delete',

  async (id, { rejectWithValue }) => {
    try {
      await axiosfetch.delete(`/questions/${id}`)
      return id
    } catch (error) {

      return rejectWithValue(error.response?.data?.message || 'Failed to delete question')
    }
  }
)

export const updateQuestion = createAsyncThunk(
  'questions/update',
  async ({ id, title, body, tags }, { rejectWithValue }) => {
    try {
      const { data } = await axiosfetch.put(`/questions/${id}`, { title, body, tags })
      return data

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update question')
    }
  }
)

const questionSlice = createSlice({
  name: 'questions',

  initialState: {
    questions: [],
    currentQuestion: null,
    loading: false,
    error: null,
    page: 1,
    hasMore: true,

  },
  reducers: {

    clearQuestions: (state) => {
      state.questions = []
      state.page = 1
      state.hasMore = true
    },
    clearCurrentQuestion: (state) => {

      state.currentQuestion = null
    },
  },

  extraReducers: (builder) => {

    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true

        state.error = null
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false

        if (action.payload.page === 1) {

          state.questions = action.payload.questions
        } else {
          state.questions = [...state.questions, ...action.payload.questions]
        }
        state.hasMore = action.payload.hasMore

        state.page = action.payload.page
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false

        state.error = action.payload
      })
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true

        state.error = null
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false

        state.currentQuestion = action.payload
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload

      })
      .addCase(createQuestion.fulfilled, (state, action) => {

        state.questions = [action.payload, ...state.questions]

      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter((q) => q._id !== action.payload)

        if (state.currentQuestion?._id === action.payload) {
          state.currentQuestion = null

        }
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {

        state.currentQuestion = action.payload
        state.questions = state.questions.map((q) =>
          q._id === action.payload._id ? action.payload : q
        )
      })
      
  },
})

export const { clearQuestions, clearCurrentQuestion } = questionSlice.actions
export default questionSlice.reducer
