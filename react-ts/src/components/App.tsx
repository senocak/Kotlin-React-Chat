import React, {useEffect, useState} from 'react'
import {Link} from "react-router-dom"
import {useAppDispatch, useAppSelector} from "../store"
import { IState } from '../store/types/global'
import {Role, UserResponse } from '../store/types/user'

function App(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const me: IState<UserResponse> = useAppSelector(state => state.me)
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

    useEffect((): void => {
        if (me.response) {
            setIsAuthorized(me.response!.user.roles.some((e: Role): boolean => e.name === 'ADMIN'))
        }
    }, [me, dispatch])
    const modeSwitcher = (): void => {
        let currentMode: string|null = document.documentElement.getAttribute('data-theme')
        if (currentMode === "dark") setTheme('light')
        else setTheme('dark')
    }

    const setTheme = (theme: string): void => {
        if (theme === "dark") {
            document.documentElement.setAttribute('data-theme', 'dark')
            window.localStorage.setItem('theme', 'dark')
            document.getElementById('theme-toggle')?.classList.add('sun')
            document.getElementById('theme-toggle')?.classList.remove('moon')
        } else {
            document.documentElement.setAttribute('data-theme', 'light')
            window.localStorage.setItem('theme', 'light')
            document.getElementById('theme-toggle')?.classList.add('moon')
            document.getElementById('theme-toggle')?.classList.remove('sun')
        }
    }
    let theme: string|null = localStorage.getItem('theme')
    theme = theme || (window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' : 'light')
    setTheme(theme)

    return  <>
                <div className="conversation-list">
                    <ul className="">
                        <li className="item"><a href="#"><i className="fa fa-list-alt"></i><span>Dashboard</span></a></li>
                        <li className="item active"><a href="#"><i className="fa fa-user"></i><span>Team chat</span><i className="fa fa-times"></i></a></li>
                        <li><a href="#"><i className="fa fa-circle-o online"></i><span>Cucu Ionel</span><i className="fa fa-times"></i></a></li>
                        <li><a href="#"><i className="fa fa-circle-o idle"></i><span>Jan Dvořák</span><i className="fa fa-times"></i></a></li>
                        <li><a href="#"><i className="fa fa-circle-o offline"></i><span>Clark Kent</span><i className="fa fa-times"></i></a></li>
                        <li><a href="#"><i className="fa fa-circle-o offline"></i><span>Ioana Marcu</span><i className="fa fa-times"></i></a></li>
                    </ul>
                    <Link to='/profile'>
                        <div className="my-account">
                            <div className="image">
                                <img src="https://secure.gravatar.com/avatar/de76e03aa6b5b0bf675c1e8a990da52f?s=64"  alt={me.response?.user.name}/>
                                <i className="fa fa-circle online"></i>
                            </div>
                            <div className="name">
                                <span>{me.response?.user.name}</span>
                                <i className="fa fa-angle-down"></i>
                                <span className="availability">Available</span>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="chat-area">
                    <div className="title"><b>Conversation title</b><i className="fa fa-search"></i></div>
                    <div className="chat-list">
                        <ul>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Hey, do you like the new interface? It's done with Font Awesome.</p>
                                    <span className="msg-time">5:00 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p><span className="blue-label">Cucu Ionel</span> I see what you did there.</p>
                                    <span className="msg-time">5:01 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Feel free to look at the code if you want.</p>
                                    <span className="msg-time">5:02 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>Yeah, will do.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>This is an example text reply.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>I know, put some more.</p>
                                    <span className="msg-time">5:06 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Here is another line.</p>
                                    <span className="msg-time">5:06 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>Yeah, will do.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Feel free to look at the code if you want.</p>
                                    <span className="msg-time">5:02 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>Yeah, will do.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Feel free to look at the code if you want.</p>
                                    <span className="msg-time">5:02 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>Yeah, will do.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="input-area">
                        <div className="input-wrapper">
                            <input type="text" value="" />
                            <i className="fa fa-smile-o"></i>
                            <i className="fa fa-paperclip"></i>
                        </div>
                        <input type="button" value="Submit" className="send-btn" />
                    </div>
                </div>
                <div className="right-tabs">
                    <ul className="tabs">
                        <li className="active">
                            <a href="#"><i className="fa fa-users"></i></a>
                        </li>
                        <li><a href="#"><i className="fa fa-paperclip"></i></a></li>
                        <li><a href="#"><i className="fa fa-link"></i></a></li>
                    </ul>
                    <ul className="tabs-container">
                        <li className="active">
                            <ul className="member-list">
                                <li><span className="status online"><i className="fa fa-circle-o"></i></span><span>Cucu Ionel</span></li>
                                <li><span className="status online"><i className="fa fa-circle-o"></i></span><span>Christian Smith</span></li>
                                <li><span className="status idle"><i className="fa fa-circle-o"></i></span><span>John Bradley</span><span className="time">10:45 pm</span></li>
                                <li><span className="status offline"><i className="fa fa-circle-o"></i></span><span>Daniel Freitz</span></li>
                            </ul>
                        </li>
                        <li></li>
                        <li></li>
                    </ul>
                    <i className="fa fa-cog"></i>
                </div>
            </>
}
export default App