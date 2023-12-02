import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import UserApiClient from "../../utils/http-client/UserApiClient"
import {IState} from "../types/global"
import {User} from "../types/user"

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

const initialState: IState<User> = {
    isLoading: false,
    response: null,
    error: null
}

const patchBlockUnblockFriendSlice = createSlice({
    name: 'user/blockUnblockFriend',
    initialState,
    reducers: {
        resetMe: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchBlockUnblockFriend.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })
        builder.addCase(fetchBlockUnblockFriend.fulfilled, (state, action: PayloadAction<User>): void => {
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
    resetMe
} = patchBlockUnblockFriendSlice.actions
