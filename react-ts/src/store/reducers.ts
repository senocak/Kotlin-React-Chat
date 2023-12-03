import { combineReducers } from '@reduxjs/toolkit'
import meSlice from "./features/auth/meSlice"
import loginSlice from "./features/auth/loginSlice"
import patchBlockUnblockFriendSlice from "./features/patchBlockUnblockFriendSlice"
import getAllUsersSlice from "./features/getAllUsersSlice"
import putFriendSlice from "./features/putFriendSlice"
import deleteFriendSlice from "./features/deleteFriendSlice"
import getAllMessagesSlice from "./features/getAllMessagesSlice"

export default combineReducers({
    me: meSlice,
    login: loginSlice,
    getAllUsers: getAllUsersSlice,
    patchBlockUnblockFriend: patchBlockUnblockFriendSlice,
    putFriend: putFriendSlice,
    deleteFriend: deleteFriendSlice,
    getAllMessages: getAllMessagesSlice,
})