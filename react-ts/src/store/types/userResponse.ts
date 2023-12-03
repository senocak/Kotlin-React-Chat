export interface UserResponse {
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
    person: UserResponse
    owner: UserResponse
    blockedBy?: UserResponse
    approvedAt?: number
    blockedAt?: number
}

export interface UserPaginationDTO {
    page: number
    pages: number
    total: number
    sort: string
    sortBy: string
    items: UserResponse[]
}
