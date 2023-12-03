import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import UserApiClient from "../../utils/http-client/UserApiClient"
import {IState} from "../types/global"
import {UserResponse} from "../types/userResponse"

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchDeleteFriend = createAsyncThunk('user/deleteFriend',
    async (email: string, {rejectWithValue}) => {
        try {
            const {data} = await userApiClient.deleteFriend(email)
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

const deleteFriendSlice = createSlice({
    name: 'user/deleteFriend',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchDeleteFriend.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })
        builder.addCase(fetchDeleteFriend.fulfilled, (state, action: PayloadAction<UserResponse>): void => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })
        builder.addCase(fetchDeleteFriend.rejected, (state, action): void => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default deleteFriendSlice.reducer
export const {
    reset
} = deleteFriendSlice.actions
