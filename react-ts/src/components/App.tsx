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

    return  <main>
                <section id="intro" style={{maxWidth: "60rem", margin: "3rem auto 0"}}>
                    <div className="flex-row-between">
                        <Link to='/'>
                            <h1 className="Flintstone glitch" data-text="Anıl Şenocak">Anıl Şenocak</h1>
                        </Link>
                        <div>
                            <button title="Change theme" id="theme-toggle" onClick={modeSwitcher} style={{float: "left"}}>
                                <div></div>
                            </button>
                            <a href="https://github.com/P0WEX" title="github" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-github"></i>
                            </a>
                            <a href="https://www.linkedin.com/in/anil-senocak/" title="linkedin" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-linkedin"></i>
                            </a>
                            {me.response === null
                                ? <Link to='/login'><i className="fa-solid fa-right-to-bracket"></i></Link>
                                :<Link to='/profile'><i className="fa-solid fa-user"></i></Link>
                            }
                        </div>
                    </div>
                    <div style={{textAlign: "justify"}}>
                        <Link to='/'>
                            <img
                                className="profile-avatar"
                                src="https://avatars.githubusercontent.com/u/6429176"
                                loading="lazy"
                                width="175px"
                                alt="Profile"
                                onError={({ currentTarget }): void => {
                                    currentTarget.onerror = null
                                    currentTarget.src="/logo512.png"
                                }}
                                style={{borderRadius: "50%", float: "left", boxShadow: "0 0 1px 11px rgb(0 0 0 / 15%), 0 0 1px 22px rgb(0 0 0 / 10%)", border: "4px solid #050506"}}
                            />
                        </Link>
                        <p>I am a citizen of the world, born and raised in Turkey. Got education from Firat University in Software Engineering.</p>
                        <p>I have interest in every single thing on the earth including politic, evolution, religion etc. Loved to be in touch with computer and technology.</p>
                        <p>Currently, I am working at <a href="https://turkcell.com.tr/" target="_blank" rel="noreferrer">Turkcell</a> as a Backend Software Engineer and living in Istanbul.</p>
                    </div>
                    <div style={{visibility: me.response !== null ? 'visible': 'hidden'}}>
                        {isAuthorized && <Link to={`/admin/kategoriler`} className="badge" style={{color: "#212529", backgroundColor: "#ffc107"}}>Kategoriler</Link>}
                        <Link to={`/admin/yazilar`} className="badge" style={{color: "#212529", backgroundColor: "#ffc107"}}>Yazılar</Link>
                        {isAuthorized && <Link to={`/admin/yorumlar`} className="badge" style={{color: "#212529", backgroundColor: "#ffc107"}}>Yorumlar</Link>}
                        <Link to={`/admin`} className="badge" style={{color: "#212529", backgroundColor: "red", textAlign: "right"}}>Çıkış</Link>
                    </div>
                </section>
            </main>
}
export default App