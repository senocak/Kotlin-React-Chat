import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import UserApiClient from "../../utils/http-client/UserApiClient"
import {IPagination, IState} from "../types/global"
import {MessagesPaginationDTO} from "../types/message"

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchGetAllMessages = createAsyncThunk('user/allMessages',
    async (params: { email: string, params: IPagination }, {rejectWithValue}) => {
        try {
            const {data} = await userApiClient.getAllMessages(params.email, params.params)
            return data
        } catch (error: any) {
            if (!error.response) {
                throw error
            }
            return rejectWithValue(error)
        }
    })

const initialState: IState<MessagesPaginationDTO> = {
    isLoading: false,
    response: null,
    error: null
}

const getAllMessagesSlice = createSlice({
    name: 'user/allMessages',
    initialState,
    reducers: {
        resetMe: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchGetAllMessages.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })
        builder.addCase(fetchGetAllMessages.fulfilled, (state, action: PayloadAction<MessagesPaginationDTO>): void => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })
        builder.addCase(fetchGetAllMessages.rejected, (state, action): void => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default getAllMessagesSlice.reducer
export const {
    resetMe
} = getAllMessagesSlice.actions
