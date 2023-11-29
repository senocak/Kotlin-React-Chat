import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import PublicApiClient from "../../../utils/http-client/PublicApiClient";
import {IState} from '../../types/global';
import {CommentDto, CommentListDto} from "../../types/comment";

const publicApiClient: PublicApiClient = PublicApiClient.getInstance()

export const fetchAllComments = createAsyncThunk('comments/getAll',
    async (_: void, {rejectWithValue}) => {
        try {
            const {data} = await publicApiClient.getComments()
            return data
        } catch (error: any) {
            if (!error.response) {
                throw error
            }

            return rejectWithValue(error)
        }
    })

const initialState: IState<CommentListDto> = {
    isLoading: false,
    response: null,
    error: null
}

const getAllCommentsSlice = createSlice({
    name: 'comments/getAll',
    initialState,
    reducers: {
        resetMe: () => initialState,
        changeVisibility: (state: IState<CommentListDto>, action): void => {
            state.response?.comment.map((commentDto: CommentDto) => {
                if (commentDto.resourceId === action.payload.comment.resourceId) {
                    commentDto.approved = action.payload.comment.approved
                }
                return commentDto
            })
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchAllComments.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchAllComments.fulfilled, (state, action: PayloadAction<CommentListDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchAllComments.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default getAllCommentsSlice.reducer
export const {
    resetMe,
    changeVisibility,
} = getAllCommentsSlice.actions
