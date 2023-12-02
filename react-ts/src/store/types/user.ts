export interface User {
    name: string
    email: string
    picture: string
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
    blockedBy?: User
    approvedAt?: number
    blockedAt?: number
}

export interface UserPaginationDTO {
    page: number
    pages: number
    total: number
    sort: string
    sortBy: string
    items: User[]
}
