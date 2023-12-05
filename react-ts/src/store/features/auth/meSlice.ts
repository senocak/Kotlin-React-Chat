import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import UserApiClient from '../../../utils/http-client/UserApiClient'
import { IState } from '../../types/global'
import {Friend, UserResponse} from '../../types/userResponse'

const userApiClient: UserApiClient = UserApiClient.getInstance()

export const fetchMe = createAsyncThunk('user/fetchMe',
    async (_: void, { rejectWithValue }) => {
        try {
            const {data} = await userApiClient.me()
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

const meSlice = createSlice({
    name: 'user/me',
    initialState,
    reducers: {
        resetMe: () => initialState,
        updateFriendsInContext: (state: IState<UserResponse>, action): void => {
            if (state.response)
                state.response!.friends = action.payload.friends
        },
        deleteFriendsInContext: (state: IState<UserResponse>, action): void => {
            console.log(action.payload)
            if (state.response)
                for (let i: number = 0; i < state.response.friends.length; i++) {
                    if (state.response.friends[i].owner.email === action.payload.email || state.response.friends[i].person.email === action.payload.email) {
                        state.response.friends.splice(i, 1)
                        return
                    }
                }
        },
        addFriendsInContext: (state: IState<UserResponse>, action): void => {
            if (state.response) {
                const newFriend: Friend = {
                    status: "Pending",
                    person: action.payload.person,
                    owner: action.payload.owner,
                    isOnline: false
                }
                state.response.friends.push(newFriend)
            }
        },
        updateOnlineOfflineFriendInContext: (state: IState<UserResponse>, action): void => {
            const emails = action.payload.data.split(",")
            const type = action.payload.type
            const me = action.payload.me
            if (state.response) {
                for (const i in emails) {
                    if (emails[i] !== me) {
                        const findIndex: number = state.response.friends.findIndex((f: Friend): boolean => f.owner.email === emails[i] || f.person.email === emails[i])
                        const friend: Friend = state.response.friends[Number(findIndex)]
                        friend.isOnline = type === 'online'
                    }
                }
            }
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchMe.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })
        builder.addCase(fetchMe.fulfilled, (state, action: PayloadAction<UserResponse>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })
        builder.addCase(fetchMe.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default meSlice.reducer
export const {
    resetMe,
    updateFriendsInContext,
    deleteFriendsInContext,
    addFriendsInContext,
    updateOnlineOfflineFriendInContext,
} = meSlice.actions
