import { Navigate } from 'react-router-dom'
import { CustomRouteRoutePropsType } from './types'

const PublicRoute = (props: CustomRouteRoutePropsType) => {
    const { isAuthenticated, element } = props
    if (!isAuthenticated)
        return element
    return <Navigate to={ { pathname: '/' } }/>
}

export default PublicRoute