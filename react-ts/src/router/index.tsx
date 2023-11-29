import React, { useState, useLayoutEffect, useEffect } from 'react'
import { Router, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import {RouteItemType, routes} from '../config/routes'
import { useAppDispatch, useAppSelector } from '../store'
import { history } from '../utils/history'
import {fetchMe} from "../store/features/auth/meSlice";
import {Role, UserResponse} from '../store/types/user'
import {IState} from "../store/types/global";

/**
 * Converts the router tree to a flat list.
 * @param routes
 */
export const getFlatRoutes = (routes: Array<RouteItemType>) => {
    let _routes: Array<RouteItemType> = []
    const worker = (items: Array<RouteItemType>, path?: string, authRequired?: boolean, role?: Role[]): void => {
        if (items.length > 0) {
            items.forEach((item: RouteItemType): void => {
                const nestedPath: string = ((path ? path : '') + item.path).replace(/\/\/+/g, '/')
                if (item.component !== undefined) {
                    _routes.push({
                        path: nestedPath,
                        component: item.component,
                        authRequired: authRequired,
                        role: item.role ? item.role : role
                    })
                }
                if (item.routes !== undefined && item.routes.length > 0) {
                    worker(
                        item.routes,
                        nestedPath,
                        item.authRequired ? item.authRequired : authRequired,
                        item.role ? item.role : role
                    )
                }
            })
        }
    }
    worker(routes)
    return _routes
}

/**
 * AppRouter component.
 * @constructor
 */
export const AppRouter = () => {
    const dispatch = useAppDispatch()
    const [state, setState] = useState({ action: history.action, location: history.location })
    const [routeItems, setRouteItems] = useState<Array<RouteItemType>>([])
    const me: IState<UserResponse> = useAppSelector(state => state.me)

    useLayoutEffect(() => history.listen(setState), [])
    useEffect((): void => {
        if (me.response === null) {
            dispatch(fetchMe())
        }
    }, [me.response, dispatch])
    useEffect((): void => {
        setRouteItems(getFlatRoutes(routes))
    }, [me.response])
    useLayoutEffect(() => history.listen(setState), [])
    return (
        <>
            {
                (routeItems.length > 0 && !me.isLoading) &&
                <Router navigator={ history } location={ state.location } navigationType={ state.action }>
                    <Routes>
                        {
                            routeItems.map((route: RouteItemType, key: number): null | React.JSX.Element => {
                                if (route.component === undefined)
                                    return null
                                if (route.authRequired !== undefined) {
                                    if (route.authRequired)
                                        return <Route path={route.path}
                                                      element={
                                                        <ProtectedRoute
                                                            isAuthenticated={me.response !== null}
                                                            isAuthorized={
                                                                me.response !== null &&
                                                                route.role !== undefined &&
                                                                route.role.some((allowedRole: Role) => me.response!!.user.roles.some((role: Role): boolean => role.name === allowedRole.name))
                                                            }
                                                            element={<route.component/>}/>
                                                      }
                                                      key={key}/>
                                    return <Route path={ route.path }
                                                  element={
                                                    <PublicRoute
                                                        //TODO: isAuthenticated={ me.response !== null }
                                                        element={ <route.component/> }/>
                                                  }
                                                  key={ key }/>
                                }
                                return <Route path={ route.path } element={ <route.component/> } key={ key }/>
                            })
                        }
                    </Routes>
                </Router>
            }
        </>
    )
}
export default AppRouter