import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import PublicApiClient from "../../../utils/http-client/PublicApiClient"
import {ICommentCreate, CommentWrapperDto} from "../../types/comment";
import {IState} from "../../types/global";

const publicApiClient: PublicApiClient = PublicApiClient.getInstance()

export const fetchPostComment = createAsyncThunk('user/post/postComment',
    async (params: {body: ICommentCreate, slug: string}, { rejectWithValue }) => {
        try {
            const { data } = await publicApiClient.postComment(params.body, params.slug)
            return data
        } catch (error: any) {
            if (!error.response) {
                throw error
            }
            return rejectWithValue(error)
        }
    })

const initialState: IState<CommentWrapperDto> = {
    isLoading: false,
    response: null,
    error: null
}

const postCommentSlice = createSlice({
    name: 'user/post/postComment',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchPostComment.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchPostComment.fulfilled, (state, action: PayloadAction<CommentWrapperDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchPostComment.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default postCommentSlice.reducer
export const {
    reset
} = postCommentSlice.actions
