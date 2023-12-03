import {UserResponse} from "./userResponse"

export interface MessagesPaginationDTO {
    page: number
    pages: number
    total: number
    sort: string
    sortBy: string
    items: MessageDTO[]
}

export interface MessageDTO {
    id: string
    from: UserResponse
    to: UserResponse
    text?: string
    binary?: string
    readAt?: number
    createdAt: number
    updatedAt: number
}