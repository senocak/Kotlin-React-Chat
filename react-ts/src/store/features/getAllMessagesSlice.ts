import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import UserApiClient from "../../utils/http-client/UserApiClient"
import {IPagination, IState} from "../types/global"
import {MessageDTO, MessagesPaginationDTO} from "../types/message"

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
        reset: () => initialState,
        addNewMessageInContext: (state: IState<MessagesPaginationDTO>, action): void => {
            const from = action.payload.from
            const to = action.payload.to
            if (state.response) {
                const messageDTOS: MessageDTO[] = state.response.items
                    .filter((messsage: MessageDTO) => {
                        return (messsage.from.email === from.email && messsage.to.email === to.email) || (messsage.from.email === to.email && messsage.to.email === from.email)
                    })
                if (messageDTOS.length > 0) {
                   // const messageDto: MessageDTO = {
                   //     id: "",
                   //     from: from,
                   //     to: to,
                   //     text: action.payload.content,
                   //     createdAt: action.payload.date,
                   //     updatedAt: action.payload.date
                   // }
                    state.response.items.push(action.payload.messageDto)
                }
            }
        },
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
    reset,
    addNewMessageInContext,
} = getAllMessagesSlice.actions
