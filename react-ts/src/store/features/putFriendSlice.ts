import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import UserApiClient from "../../utils/http-client/UserApiClient"
import {IState} from "../types/global"
import {User} from "../types/user"

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchPutFriend = createAsyncThunk('user/putFriend',
    async (email: string, {rejectWithValue}) => {
        try {
            const {data} = await userApiClient.putFriend(email)
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

const putFriendSlice = createSlice({
    name: 'user/putFriend',
    initialState,
    reducers: {
        resetMe: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchPutFriend.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })
        builder.addCase(fetchPutFriend.fulfilled, (state, action: PayloadAction<User>): void => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })
        builder.addCase(fetchPutFriend.rejected, (state, action): void => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default putFriendSlice.reducer
export const {
    resetMe
} = putFriendSlice.actions
