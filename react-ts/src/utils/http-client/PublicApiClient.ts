import AbstractHttpClient from './AbstractHttpClient'
import app from "../../config/app"

export default class PublicApiClient extends AbstractHttpClient {
    /**
     * @private classInstance
     */
    private static classInstance?: PublicApiClient

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
    protected _initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use(this._handleResponse, this._authenticatedHandleError)
    }

    /**
     * Get instance.
     * @public getInstance
     */
    public static getInstance() {
        if (!this.classInstance) {
            this.classInstance = new this()
        }

        return this.classInstance
    }
}
