import AbstractHttpClient from './AbstractHttpClient'
import app from "../../config/app";
import {ICommentCreate} from "../../store/types/comment";

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

    public getCategories = async (posts: boolean = true) =>
        await this.instance.get(`/categories?posts=${posts}`)
    /*
    public getCategories2 = async (posts: boolean = true) => {
        this.instance.defaults.headers["Authorization"] = null
        this._initializeRequestInterceptor(false)
        return await this.instance.get(`/categories?posts=${posts}`)
    }
    */

    public getPost = async (slug: string) => await this.instance.get(`/posts/${slug}`)
    public postComment = async (params: ICommentCreate, slug: string) => await this.instance.post(`/posts/${slug}/comment`, params)
    public getAllPosts = async (next: number = 0, max: number = 99, username?: string, category?: string) => {
        let url: string = `/posts?next=${next}&max=${max}`
        if (category) url = `${url}&category=${category}`
        if (username) url = `${url}&username=${username}`
        return await this.instance.get(url)
    }
    public getComments = async (next: number = 0, max: number = 99) =>
        await this.instance.get(`/comments?next=${next}&max=${max}`)
}
