import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {IState} from "../../types/global"
import UserApiClient from '../../../utils/http-client/UserApiClient'

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchDeleteCategory = createAsyncThunk('category/delete',
                                                    async (slug: string, { rejectWithValue }) => {
    try {
        const { data } = await userApiClient.deleteCategory(slug)
        return data
    } catch (error: any) {
        if (!error.response) {
            throw error
        }
        return rejectWithValue(error)
    }
})

const initialState: IState<null> = {
    isLoading: false,
    response: null,
    error: null
}

const deleteCategorySlice = createSlice({
    name: 'category/delete',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder.addCase(fetchDeleteCategory.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchDeleteCategory.fulfilled, (state, action: PayloadAction<null>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchDeleteCategory.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default deleteCategorySlice.reducer
export const {
    reset
} = deleteCategorySlice.actions
