import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {IState} from "../../types/global"
import UserApiClient from '../../../utils/http-client/UserApiClient'
import {CommentWrapperDto} from "../../types/comment";

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchUpdateCommentVisible = createAsyncThunk('post/patchComment',
    async (body: {slug: string, commentId: string, approve: boolean}, { rejectWithValue }) => {
        try {
            const { data } = await userApiClient.patchPostCommentVisible(body.slug, body.commentId, body.approve)
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

const patchCommentVisibilitySlice = createSlice({
    name: 'post/patchComment',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchUpdateCommentVisible.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchUpdateCommentVisible.fulfilled, (state, action: PayloadAction<CommentWrapperDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchUpdateCommentVisible.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default patchCommentVisibilitySlice.reducer
export const {
    reset,
} = patchCommentVisibilitySlice.actions
