import React, {useEffect, useState} from 'react'
import App from "./App"
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

    const [enteredVal, setEnteredVal] = useState<string>("")
    const [text, setText] = useState<string>(generateRandom())
    const handleSubmit = (e: any): void => {
        e.preventDefault()
        const usernameVal = e.target[0].value.trim()
        const passwordVal = e.target[1].value.trim()
        if (!usernameVal || !passwordVal) {
            alert("Email ve şifre boş olamaz")
            return
        }
        if (enteredVal.toUpperCase() !== text.toUpperCase()) {
            setEnteredVal("")
            //alert("Captcha not valid")
        }
        dispatch(fetchLogin({username: usernameVal, password: passwordVal}))
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
    return <>
        <App/>
        <form onSubmit={handleSubmit} style={{maxWidth: '75%', textAlign: 'center', paddingLeft: '25%'}} >
            <input type="text" placeholder="Username" className="input" required autoFocus disabled={loginSlice.isLoading} value="asenocakAdmin"/>
            <input type="password" placeholder="***" className="input" required disabled={loginSlice.isLoading} value="asenocak"/>
            <Captcha
                text={text}
                width={100}
                height={50}
                fontSize={20}
                onClick={(): void => {
                    setText(generateRandom())
                    setEnteredVal("")
                }}/>
            <input type="text" placeholder="Captcha"className='input' required value={text}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {setEnteredVal(e.target.value)}}
                disabled={loginSlice.isLoading}/>
            <button className="input" disabled={loginSlice.isLoading}>
                Giriş Yap
                <i className="fas fa-spinner fa-pulse" style={{visibility: loginSlice.isLoading ? 'visible': 'hidden'}}></i>
            </button>
        </form>
    </>
}
export default Login