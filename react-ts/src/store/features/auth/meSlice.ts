import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import UserApiClient from '../../../utils/http-client/UserApiClient'
import { IState } from '../../types/global'
import {UserResponse} from '../../types/user'

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchMe = createAsyncThunk('user/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await userApiClient.me()
            return data
        } catch (error: any) {
            if (!error.response) {
                throw error
            }

            return rejectWithValue(error)
        }
    })

const initialState: IState<UserResponse> = {
    isLoading: false,
    response: null,
    error: null
}

const meSlice = createSlice({
    name: 'user/me',
    initialState,
    reducers: {
        resetMe: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchMe.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchMe.fulfilled, (state, action: PayloadAction<UserResponse>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchMe.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default meSlice.reducer
export const {resetMe} = meSlice.actions
