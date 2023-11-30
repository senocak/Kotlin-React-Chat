export interface UserResponse {
    user: User
}

export interface User {
    name: string
    email: string
    roles: Role[]
    friends: Friend[]
}

export interface Role {
    name: string
}

export interface Friend {
    status: string
    person: User
    owner: User
}