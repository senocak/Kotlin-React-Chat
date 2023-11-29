export interface UserResponse {
    user: User
}

export interface User {
    name: string
    email: string
    username: string
    roles: Role[]
    resourceUrl: string
}

export interface Role {
    name: string
}
