import React, {useEffect, useState} from 'react'
import {generateRandom} from "../utils"
import Captcha from "./Captcha"
import { useAppDispatch, useAppSelector } from '../store'
import {IState} from "../store/types/global"
import {ILoginResponse} from "../store/types/auth"
import { fetchLogin } from '../store/features/auth/loginSlice'
import {NavigateFunction, useNavigate } from 'react-router-dom'
import { fetchMe } from '../store/features/auth/meSlice'

function Login(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const navigate: NavigateFunction = useNavigate()
    const loginSlice: IState<ILoginResponse> = useAppSelector(state => state.login)

    const [text, setText] = useState<string>(generateRandom())
    const [enteredVal, setEnteredVal] = useState<string>(text)
    const handleSubmit = (e: any): void => {
        e.preventDefault()
        const emailVal = e.target[0].value.trim()
        const passwordVal = e.target[1].value.trim()
        if (!emailVal || !passwordVal) {
            alert("Email ve şifre boş olamaz")
            return
        }
        if (enteredVal.toUpperCase() !== text.toUpperCase()) {
            setEnteredVal("")
            alert("Captcha not valid")
        }
        dispatch(fetchLogin({email: emailVal, password: passwordVal}))
        e.target[0].value = ''
        e.target[1].value = ''
        return
    }
    useEffect((): void => {
        if (!loginSlice.isLoading && loginSlice.response !== null) {
            dispatch(fetchMe())
            navigate('/profile')
        }
    }, [loginSlice, dispatch, navigate])
    return <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" required autoFocus disabled={loginSlice.isLoading} value="anil1@senocak.com"/>
            <input type="password" placeholder="***" required disabled={loginSlice.isLoading} value="asenocak"/>
            <Captcha
                text={text}
                width={100}
                height={50}
                fontSize={20}
                onClick={(): void => {
                    setText(generateRandom())
                    setEnteredVal("")
                }}/>
            <input type="text" placeholder="Captcha" required value={text}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {setEnteredVal(e.target.value)}}
                disabled={loginSlice.isLoading}/>
            <button disabled={loginSlice.isLoading}>
                Giriş Yap
                <i className="fas fa-spinner fa-pulse" style={{visibility: loginSlice.isLoading ? 'visible': 'hidden'}}></i>
            </button>
        </form>
}
export default Login