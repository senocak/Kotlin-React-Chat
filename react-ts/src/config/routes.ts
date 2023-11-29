import React from 'react'
import Login from "../components/Login"
import NotFound from "../components/NotFound"
import YaziDetay from "../components/YaziDetay"
import Home from "../components/Home"
import Profile from '../components/Profile'
import { Role } from '../store/types/user'
import Forbidden from "../components/Forbidden"
import CategoryAdd from '../components/admin/kategori/CategoryAdd'
import AllCategories from '../components/admin/kategori/AllCategories'
import CategoryEdit from "../components/admin/kategori/CategoryEdit"
import AllPosts from '../components/admin/yazilar/AllPosts'
import PostCreate from "../components/admin/yazilar/PostCreate"
import PostEdit from "../components/admin/yazilar/PostEdit"
import AllComments from "../components/admin/AllComments"

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
        authRequired: false, // TODO: why
        routes: [
            {
                path: '/yazi/:slug',
                component: YaziDetay,
                authRequired: false,
            }
        ]
    },
    {
        path: '/login',
        authRequired: false,
        component: Login
    },
    {
        path: '/profile',
        authRequired: true,
        component: Profile,
        role: [
            {name: 'USER'},
            {name: 'ADMIN'}
        ]
    },
    {
        path: '/admin',
        authRequired: true,
        component: Home,
        role: [
            {name: 'ADMIN'}
        ],
        routes: [
            {
                path: '/kategoriler',
                component: AllCategories,
                routes: [
                    {
                        path: '/ekle',
                        component: CategoryAdd
                    },
                    {
                        path: '/:slug',
                        component: CategoryEdit
                    }
                ]
            },
            {
                path: '/yazilar',
                component: AllPosts,
                role: [
                    {name: 'USER'},
                    {name: 'ADMIN'}
                ],
                routes: [
                    {
                        path: '/ekle',
                        component: PostCreate
                    },
                    {
                        path: '/:slug',
                        component: PostEdit
                    }
                ]
            },
            {
                path: '/yorumlar',
                component: AllComments,
                role: [
                    {name: 'ADMIN'}
                ]
            }
        ]
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
