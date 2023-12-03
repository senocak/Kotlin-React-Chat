import AbstractHttpClient from './AbstractHttpClient'
import app from "../../config/app"
import {IPagination} from "../../store/types/global"
import {AxiosResponse} from "axios"

export default class UserApiClient extends AbstractHttpClient {
    /**
     * @private classInstance
     */
    private static classInstance?: UserApiClient

    /**
     * @private constructor
     */
    private constructor() {
        super(`${app.API_BASE}${app.API_VERSION}`.replace(/^\/|\/$/g, ''))
        this._initializeRequestInterceptor()
        this._initializeResponseInterceptor()
    }

    /**
     * Initialize request interceptor.
     * @protected _initializeResponseInterceptor
     */
    protected _initializeResponseInterceptor = (): void => {
        this.instance.interceptors.response.use(this._handleResponse, this._authenticatedHandleError)
    }

    /**
     * Get instance.
     * @public getInstance
     */
    public static getInstance(): UserApiClient {
        if (!this.classInstance) {
            this.classInstance = new this()
        }
        return this.classInstance
    }

    public me = async () =>
        await this.instance.get<AxiosResponse>('/user/me')

    public getAllUsers = async (data: IPagination) => {
        let url: string = `/user?page=${data.page}&size=${data.size}&sort=${data.sort}&sortBy=${data.sortBy}`
        if (data.q !== null)
            url = `${url}&q=${data.q}`
        return await this.instance.get(url)
    }

    public patchBlockUnBlock = async (email: string, operation: string) =>
        await this.instance.patch<AxiosResponse>(`/user/friend/${email}?operation=${operation}`)

    public putFriend = async (email: string) =>
        await this.instance.put<AxiosResponse>(`/user/friend/${email}`)

    public deleteFriend = async (email: string) =>
        await this.instance.delete<AxiosResponse>(`/user/friend/${email}`)

    public getAllMessages = async (email: string, data: IPagination) => {
        let url: string = `/user/message/${email}?page=${data.page}&size=${data.size}&sort=${data.sort}&sortBy=${data.sortBy}`
        if (data.q !== null)
            url = `${url}&q=${data.q}`
        return await this.instance.get(url)
    }
}
