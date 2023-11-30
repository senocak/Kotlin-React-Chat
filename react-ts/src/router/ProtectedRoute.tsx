import { Navigate } from 'react-router-dom'
import { CustomRouteRoutePropsType } from './types'
import React from "react";

const ProtectedRoute = (props: CustomRouteRoutePropsType): React.JSX.Element => {
    const { isAuthenticated, isAuthorized, element }: CustomRouteRoutePropsType = props
    if (isAuthenticated) {
        if (isAuthorized)
            return element
        return <Navigate to={ { pathname: '/forbidden' } }/>
    }
    return <Navigate to={ { pathname: '/login' } }/>
}

export default ProtectedRoute