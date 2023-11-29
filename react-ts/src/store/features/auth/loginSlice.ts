import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import AuthApiClient from '../../../utils/http-client/AuthApiClient'
import {ILoginParams, ILoginResponse} from "../../types/auth";
import { IState } from '../../types/global';
import AppStorage from "../../../utils/storage";

const authApiClient: AuthApiClient = AuthApiClient.getInstance()

export const fetchLogin = createAsyncThunk('auth/fetchLogin',
                                        async (params: ILoginParams, { rejectWithValue }) => {
    try {
        const { data } = await authApiClient.login(params)
        return data
    } catch (error: any) {
        if (!error.response) {
            throw error
        }

        return rejectWithValue(error)
    }
})

const initialState: IState<ILoginResponse> = {
    isLoading: false,
    response: null,
    error: null
}

const authLoginSlice = createSlice({
    name: 'auth/login',
    initialState,
    reducers: {
        reset: () => initialState,
        logout: () => {
            AppStorage.removeTokens()
            return initialState
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchLogin.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchLogin.fulfilled, (state, action: PayloadAction<ILoginResponse>) => {
            AppStorage.setTokens(action.payload.token, action.payload.refreshToken)
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchLogin.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default authLoginSlice.reducer
export const {
    reset,
    logout
} = authLoginSlice.actions