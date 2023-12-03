import { UserResponse } from "./userResponse"

export interface ILoginParams {
    email: string
    password: string
}

export interface ILoginResponse {
    token: string
    refreshToken: string
    user: UserResponse
}
