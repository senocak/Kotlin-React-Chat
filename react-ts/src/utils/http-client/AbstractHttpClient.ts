import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
//import i18next from 'i18next'
import AppStorage from '../storage'
import store from '../../store'
import TokenType from "../storage/TokenType";

declare module 'axios' {
    /**
     * @interface AxiosResponse
     */
    interface AxiosResponse<T = any> extends Promise<T> {}
}

export default abstract class AbstractHttpClient {
    /**
     * @protected instance
     */
    protected readonly instance: AxiosInstance

    /**
     * @param baseURL
     * @protected constructor
     */
    protected constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL: baseURL
        })

        this._initializeResponseInterceptor()
        this._initializeRequestInterceptor()
    }

    /**
     * Initialize response interceptor.
     * @protected _initializeResponseInterceptor
     */
    protected _initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use(this._handleResponse, this._handleError)
    }

    /**
     * Initialize request interceptor.
     * @protected _initializeRequestInterceptor
     * @param isAuthenticated
     * @param isRefresh
     */
    protected _initializeRequestInterceptor = (isAuthenticated: boolean = true, isRefresh: boolean = false) => {
        this.instance.interceptors.request.use(async config => {
            config.headers = config.headers ?? {}
            config.headers.Locale = AppStorage.getLocale()

            if (isAuthenticated) {
                const token: TokenType = isRefresh ? AppStorage.getRefreshToken() : AppStorage.getAccessToken()
                if (token) {
                    config.headers.Authorization = `Bearer ${ token }`
                }
            }
            return config
        }, error => Promise.reject(error))
    }

    /**
     * Handle response.
     * @protected _handleResponse
     * @param response
     */
    protected _handleResponse = (response: AxiosResponse) => response

    /**
     * Handle error.
     * @protected _handleError
     * @param error
     */
    protected _handleError = (error: AxiosError) => {
        if (!error.response) {
            console.error('Please check your internet connection.')
        }
        return Promise.reject(error)
    }

    /**
     * Remove tokens from storage.
     * @protected _removeTokensFromStorage
     */
    protected _removeTokensFromStorage = async (): Promise<void> => {
        AppStorage.removeTokens()
    }

    /**
     * Initialize request interceptor.
     * @protected _initializeRequestForRefresh
     */
    protected _initializeRequest = (): void => {
        this.instance.interceptors.request.clear()
        this._initializeRequestInterceptor()
    }

    /**
     * Initialize request interceptor for refresh.
     * @protected _initializeRequestForRefresh
     */
    protected _initializeRequestForRefresh = (): void => {
        this.instance.interceptors.request.clear()
        this._initializeRequestInterceptor(true, true)
    }

    /**
     * Remove user store.
     * @protected
     */
    protected _removeUserStore() {
        store.dispatch({ type: 'auth/login/resetLogin', payload: null })
        store.dispatch({ type: 'user/me/resetMe', payload: null })
    }

    /**
     * Authenticated handle error.
     * @protected _handleError
     * @param error
     */
    protected _authenticatedHandleError = async (error: AxiosError) => {
        const statusCode: number = Number(error.response?.status)

        if (401 === statusCode) {
            if (AppStorage.getRefreshToken() !== null) {
                const refreshApiUrlPath = '/auth/refresh'

                if (error.config?.url !== refreshApiUrlPath) {
                    try {
                        const originalRequest = error.config!

                        this._initializeRequestForRefresh()
                        const { data } = await this.instance.post(refreshApiUrlPath)
                        AppStorage.setTokens(data.token, data.refreshToken)

                        this._initializeRequest()
                        return this.instance(originalRequest)
                    } catch (e) {
                        await this._removeTokensFromStorage()
                        return Promise.reject(error)
                    }
                }
            } else {
                await this._removeTokensFromStorage()
                this._removeUserStore()
                //history.push('/login')
            }
        } else if (403 === statusCode) {
            //console.error(i18next.t('errors_types.forbidden'))
        } else if (500 <= statusCode) {
            //console.error(i18next.t('errors_types.unsuccessful'))
        }

        return Promise.reject(error)
    }
}
