import React from 'react'
import { useAppDispatch, useAppSelector } from '../store';
import { IState } from '../store/types/global';
import { UserResponse } from '../store/types/user';
import App from "./App";
import {Link} from "react-router-dom";

function Profile(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const me: IState<UserResponse> = useAppSelector(state => state.me)

    return <>
        {JSON.stringify(me.response)}
        <Link to='/'>anasayfa</Link>
    </>
}

export default Profile