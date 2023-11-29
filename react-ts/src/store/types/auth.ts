import { User } from "./user"

export interface ILoginParams {
    username: string
    password: string
}

export interface ILoginResponse {
    token: string
    refreshToken: string
    user: User
}
