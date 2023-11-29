import AbstractHttpClient from './AbstractHttpClient'
import app from "../../config/app";
import { CategoryCreateRequestDto, CategoryUpdateRequestDto} from '../../store/types/category';
import {CreatePostDto, PostUpdateDto} from '../../store/types/post';

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

    public createCategory = async (body: CategoryCreateRequestDto) =>
        await this.instance.post('/categories', body)
    public deleteCategory = async (slug: string) =>
        await this.instance.delete('/categories/' + slug)
    public patchCategory = async (slug: string, body: CategoryUpdateRequestDto) =>
        await this.instance.patch('/categories/' + slug, body)
    public createPost = async (body: CreatePostDto) =>
        await this.instance.post('/posts', body)
    public deletePost = async (slug: string) =>
        await this.instance.delete('/posts/' + slug)
    public patchPost = async (slug: string, body: PostUpdateDto) =>
        await this.instance.patch('/posts/' + slug, body)
    public patchPostCommentVisible = async (slug: string, commentId: string, approve: boolean) =>
        await this.instance.patch(`/posts/${slug}/comment/${commentId}?approve=${approve}`)
}
