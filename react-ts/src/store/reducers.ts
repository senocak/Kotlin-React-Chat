import { combineReducers } from '@reduxjs/toolkit'
import meSlice from "./features/auth/meSlice"
import loginSlice from "./features/auth/loginSlice"
import getAllCommentsSlice from "./features/comment/getAllCommentsSlice"

export default combineReducers({
    me: meSlice,
    login: loginSlice,

    getAllComments: getAllCommentsSlice,
})