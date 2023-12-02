import React, {useEffect, useState} from 'react'
import {generateRandom} from "../utils"
import Captcha from "./Captcha"
import { useAppDispatch, useAppSelector } from '../store'
import {IState} from "../store/types/global"
import {ILoginResponse} from "../store/types/auth"
import { fetchLogin } from '../store/features/auth/loginSlice'
import {Link, NavigateFunction, useNavigate} from 'react-router-dom'
import { fetchMe } from '../store/features/auth/meSlice'
import Notification from "./Notification"

function Login(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const navigate: NavigateFunction = useNavigate()
    const loginSlice: IState<ILoginResponse> = useAppSelector(state => state.login)
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
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
            return
        }
        dispatch(fetchLogin({email: emailVal, password: passwordVal}))
        e.target[0].value = ''
        e.target[1].value = ''
        return
    }
    useEffect((): void => {
        if (!loginSlice.isLoading && loginSlice.response !== null) {
            dispatch(fetchMe())
            navigate('/')
        } else if (loginSlice.error !== null) {
            const exception = loginSlice.error.response.data.exception
            let message: string = `${exception.error.id}: ${exception.error.text}`
            exception.variables.forEach((variable: string): string => message = `${message}</br>${variable}`)

            setNotification({show: true, color: 'red', msg: `${message}`})
            setTimeout((): void => {
                setNotification({show: false, color: '', msg: ''})
            }, 3000)
        }
    }, [loginSlice, dispatch, navigate])
    return <>
            <div className="form">
                <form className="login-form" onSubmit={handleSubmit}>
                    <input type="text" placeholder="Username" required autoFocus disabled={loginSlice.isLoading} value="anil@senocak.com"/>
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
                    <p className="message">Not registered? <Link to="/register">Create an account</Link></p>
                </form>
            </div>
        {notification.show && <Notification color={notification.color} message={notification.msg}/>}
        </>
}
export default Login