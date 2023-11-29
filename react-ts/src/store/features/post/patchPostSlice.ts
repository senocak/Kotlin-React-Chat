import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {IState} from "../../types/global"
import UserApiClient from '../../../utils/http-client/UserApiClient'
import {PostUpdateDto, PostWrapperDto} from "../../types/post";

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchUpdatePost = createAsyncThunk('post/patch',
    async (body: {slug: string, dto: PostUpdateDto}, { rejectWithValue }) => {
        try {
            const { data } = await userApiClient.patchPost(body.slug, body.dto)
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

const patchPostSlice = createSlice({
    name: 'post/patch',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchUpdatePost.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchUpdatePost.fulfilled, (state, action: PayloadAction<PostWrapperDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchUpdatePost.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default patchPostSlice.reducer
export const {
    reset
} = patchPostSlice.actions
