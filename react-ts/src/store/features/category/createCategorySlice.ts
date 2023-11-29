import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {CategoryWrapperDto, CategoryCreateRequestDto} from "../../types/category"
import {IState} from "../../types/global"
import UserApiClient from '../../../utils/http-client/UserApiClient'

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchCreateCategory = createAsyncThunk('category/create',
                                               async (body: CategoryCreateRequestDto, { rejectWithValue }) => {
    try {
        const { data } = await userApiClient.createCategory(body)
        return data
    } catch (error: any) {
        if (!error.response) {
            throw error
        }
        return rejectWithValue(error)
    }
})

const initialState: IState<CategoryWrapperDto> = {
    isLoading: false,
    response: null,
    error: null
}

const createCategorySlice = createSlice({
    name: 'category/create',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchCreateCategory.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchCreateCategory.fulfilled, (state, action: PayloadAction<CategoryWrapperDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchCreateCategory.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default createCategorySlice.reducer
export const {
    reset
} = createCategorySlice.actions
