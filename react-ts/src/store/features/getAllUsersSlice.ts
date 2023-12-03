import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import UserApiClient from "../../utils/http-client/UserApiClient"
import {IPagination, IState} from "../types/global"
import {UserPaginationDTO} from "../types/userResponse"

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchGetAllUsers = createAsyncThunk('user/allUsers',
    async (params: IPagination, {rejectWithValue}) => {
        try {
            const {data} = await userApiClient.getAllUsers(params)
            return data
        } catch (error: any) {
            if (!error.response) {
                throw error
            }
            return rejectWithValue(error)
        }
    })

const initialState: IState<UserPaginationDTO> = {
    isLoading: false,
    response: null,
    error: null
}

const getAllUsersSlice = createSlice({
    name: 'user/allUsers',
    initialState,
    reducers: {
        resetMe: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchGetAllUsers.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })
        builder.addCase(fetchGetAllUsers.fulfilled, (state, action: PayloadAction<UserPaginationDTO>): void => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })
        builder.addCase(fetchGetAllUsers.rejected, (state, action): void => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default getAllUsersSlice.reducer
export const {
    resetMe
} = getAllUsersSlice.actions
