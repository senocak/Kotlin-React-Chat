import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import UserApiClient from "../../utils/http-client/UserApiClient"
import {IState} from "../types/global"
import {UserResponse} from "../types/userResponse"

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchBlockUnblockFriend = createAsyncThunk('user/blockUnblockFriend',
    async (body: {email: string, operation: string}, {rejectWithValue}) => {
        try {
            const {data} = await userApiClient.patchBlockUnBlock(body.email, body.operation)
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

const patchBlockUnblockFriendSlice = createSlice({
    name: 'user/blockUnblockFriend',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchBlockUnblockFriend.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })
        builder.addCase(fetchBlockUnblockFriend.fulfilled, (state, action: PayloadAction<UserResponse>): void => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })
        builder.addCase(fetchBlockUnblockFriend.rejected, (state, action): void => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default patchBlockUnblockFriendSlice.reducer
export const {
    reset
} = patchBlockUnblockFriendSlice.actions
