import React from 'react'
import { useAppDispatch, useAppSelector } from '../store';
import { IState } from '../store/types/global';
import { UserResponse } from '../store/types/user';
import App from "./App";

function Profile(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const me: IState<UserResponse> = useAppSelector(state => state.me)

    return <>
        <App/>
        {JSON.stringify(me.response)}
    </>
}

export default Profile