import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {IState} from "../../types/global"
import UserApiClient from '../../../utils/http-client/UserApiClient'
import { CreatePostDto, PostWrapperDto } from '../../types/post'

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchCreatePost = createAsyncThunk('post/create',
                                                async (body: CreatePostDto, { rejectWithValue }) => {
    try {
        const { data } = await userApiClient.createPost(body)
        return data
    } catch (error: any) {
        if (!error.response) {
            throw error
        }
        return rejectWithValue(error)
    }
})

const initialState: IState<PostWrapperDto> = {
    isLoading: false,
    response: null,
    error: null
}

const createPostSlice = createSlice({
    name: 'post/create',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchCreatePost.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchCreatePost.fulfilled, (state, action: PayloadAction<PostWrapperDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchCreatePost.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default createPostSlice.reducer
export const {
    reset
} = createPostSlice.actions
