import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import PublicApiClient from "../../../utils/http-client/PublicApiClient"
import {PostWrapperDto} from "../../types/post"
import {IState} from "../../types/global";

const publicApiClient: PublicApiClient = PublicApiClient.getInstance()

export const fetchGetSingle = createAsyncThunk('user/post/getSingle',
    async (slug: string, { rejectWithValue }) => {
        try {
            const { data } = await publicApiClient.getPost(slug)
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

const getSinglePostSlice = createSlice({
    name: 'user/post/getSingle',
    initialState,
    reducers: {
        resetPost: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchGetSingle.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchGetSingle.fulfilled, (state, action: PayloadAction<PostWrapperDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchGetSingle.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default getSinglePostSlice.reducer
export const {
    resetPost
} = getSinglePostSlice.actions
