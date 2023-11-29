export interface CommentDto {
    resourceId: string
    name: string
    email: string
    body: string
    approved: boolean
    createdAt: number
    postId: string
}

export interface CommentWrapperDto {
    comment: CommentDto
}

export interface ICommentCreate {
    name: string,
    email: string,
    body: string,
}

export interface CommentListDto {
    comment: CommentDto[]
    total: number
    next: number
    resourceUrl: string
}