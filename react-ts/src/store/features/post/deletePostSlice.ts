import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {IState} from "../../types/global"
import UserApiClient from '../../../utils/http-client/UserApiClient'

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchDeletePost = createAsyncThunk('post/delete',
    async (slug: string, { rejectWithValue }) => {
        try {
            const { data } = await userApiClient.deletePost(slug)
            return data
        } catch (error: any) {
            if (!error.response) {
                throw error
            }
            return rejectWithValue(error)
        }
    })

const initialState: IState<null> = {
    isLoading: false,
    response: null,
    error: null
}

const deletePostSlice = createSlice({
    name: 'post/delete',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchDeletePost.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchDeletePost.fulfilled, (state, action: PayloadAction<null>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchDeletePost.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default deletePostSlice.reducer
export const {
    reset
} = deletePostSlice.actions
