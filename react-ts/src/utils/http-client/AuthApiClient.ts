import { AxiosError } from 'axios'
import AbstractHttpClient from './AbstractHttpClient'
import history from '../history'
import app from "../../config/app"
import { ILoginParams } from "../../store/types/auth"

export default class AuthApiClient extends AbstractHttpClient {
    /**
     * @private classInstance
     */
    private static classInstance?: AuthApiClient

    /**
     * @private constructor
     */
    private constructor() {
        super(`${app.API_BASE}${app.API_VERSION}`.replace(/^\/|\/$/g, ''))
        this._initializeResponseInterceptor()
    }

    /**
     * Initialize request interceptor.
     * @protected _initializeResponseInterceptor
     */
    protected _initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use(this._handleResponse, this._handleError)
    }

    /**
     * Handle error.
     * @protected _handleError
     * @param error
     */
    protected _handleError = async (error: AxiosError) => {
        const statusCode: number = Number(error.response?.status)
        const originalRequest = error.config

        originalRequest!.headers = originalRequest!.headers ?? {}

        if (originalRequest!.headers.Authorization && 401 === statusCode) {
            await this._removeTokensFromStorage()
            history.push('/login')
        }

        return Promise.reject(error)
    }

    /**
     * Get instance.
     * @public getInstance
     */
    public static getInstance(): AuthApiClient {
        if (!this.classInstance)
            this.classInstance = new this()
        return this.classInstance
    }

    public login = async (params: ILoginParams) =>
        await this.instance.post('/auth/login', params)

    /**
     * Refresh token.
     */
    public refresh = async () => {
        this._initializeRequestForRefresh()
        return await this.instance.patch('/auth/refresh')
    }
}
