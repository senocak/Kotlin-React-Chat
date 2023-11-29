import {User} from "./user"
import {CommentDto} from "./comment"
import {Category} from "./category";

export interface Post {
    resourceId: string
    slug: string
    title: string
    body: string
    user: User
    categories: Category[]
    tags: string[]
    createdAt: number
    updatedAt: number
    comments?: CommentDto[]
}

export interface PostWrapperDto {
    post: Post
}

export interface PostsDto {
    post: Post[]
    total: number
    next: number
    resourceUrl: string
}

export interface CreatePostDto {
    title: string
    body: string
    category: string[]
    tags?: string[]
}

export interface PostUpdateDto {
    title?: string
    body?: string
    category?: string[]
    tags?: string[]
}