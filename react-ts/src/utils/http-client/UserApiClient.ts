import AbstractHttpClient from './AbstractHttpClient'
import app from "../../config/app"

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

    public me = async () => await this.instance.get('/user/me')
}
