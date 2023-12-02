import React from 'react'
import Login from "../components/Login"
import NotFound from "../components/NotFound"
import Home from "../components/Home"
import { Role } from '../store/types/user'
import Forbidden from "../components/Forbidden"

export type RouteItemType = {
    path: string
    component?: React.ComponentType<any>
    authRequired?: boolean
    routes?: Array<RouteItemType>
    role?: Role[]
}

export const routes: Array<RouteItemType> = [
    {
        path: '/',
        component: Home,
        authRequired: true,
        role: [
            {name: 'USER'},
            {name: 'ADMIN'}
        ]
    },
    {
        path: '/login',
        authRequired: false,
        component: Login
    },
    {
        path: '/forbidden',
        component: Forbidden
    },
    {
        path: '*',
        component: NotFound
    }
]

export default routes
