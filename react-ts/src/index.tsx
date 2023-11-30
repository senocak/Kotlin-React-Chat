import React from 'react'
import ReactDOM, {Root} from 'react-dom/client'
import './index.css'
import reportWebVitals from './reportWebVitals'
import {Provider} from "react-redux"
import store from "./store"
import AppRouter from "./router"

const root: Root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)
root.render(
    <Provider store={ store }>
        <div className="window-wrapper">
            <div className="window-title">
                <div className="dots">
                    <a href="http://github.com/senocak" target="_blank"><i className="fa-brands fa-github"></i></a>
                </div>
                <div className="title">
                    <a href="https://github.com/senocak/Kotlin-React-Chat" target="_blank"><span>Kotlin(SpringBoot)/Typescript(React) Chat</span></a>
                </div>
                <div className="expand">
                    <i className="fa-solid fa-skull-crossbones"></i>
                </div>
            </div>
            <div className="window-area">
                <AppRouter/>
            </div>
        </div>
    </Provider>
)
// https://codepen.io/CucuIonel/pen/yLaLGL
reportWebVitals()