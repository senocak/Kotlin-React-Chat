import { User } from "./user"

export interface ILoginParams {
    email: string
    password: string
}

export interface ILoginResponse {
    token: string
    refreshToken: string
    user: User
}
