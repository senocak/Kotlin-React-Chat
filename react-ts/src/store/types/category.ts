import {Post} from "./post"

export interface Categories {
    category: Category[]
    next: number
    total: number
    resourceUrl: string
}

export interface CategoryWrapperDto {
    category: Category
}

export interface Category {
    resourceId: string
    name: string
    slug: string
    image: string
    resourceUrl: string
    posts?: Post[]
}

export interface CategoryCreateRequestDto {
    name: string
    image: string
}

export interface CategoryUpdateRequestDto {
    name?: string
    image?: string
}