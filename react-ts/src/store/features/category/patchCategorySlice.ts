import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {CategoryWrapperDto, CategoryUpdateRequestDto} from "../../types/category"
import {IState} from "../../types/global"
import UserApiClient from '../../../utils/http-client/UserApiClient'

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchUpdateCategory = createAsyncThunk('category/patch',
                                                    async (body: {slug: string, dto: CategoryUpdateRequestDto}, { rejectWithValue }) => {
    try {
        const { data } = await userApiClient.patchCategory(body.slug, body.dto)
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

const patchCategorySlice = createSlice({
    name: 'category/patch',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchUpdateCategory.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchUpdateCategory.fulfilled, (state, action: PayloadAction<CategoryWrapperDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchUpdateCategory.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default patchCategorySlice.reducer
export const {
    reset
} = patchCategorySlice.actions
