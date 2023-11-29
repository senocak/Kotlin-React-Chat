import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import PublicApiClient from "../../../utils/http-client/PublicApiClient"
import {IState} from '../../types/global'
import {Post, PostsDto} from "../../types/post"
import {CommentDto} from "../../types/comment";

const publicApiClient: PublicApiClient = PublicApiClient.getInstance()

export const fetchAllPosts = createAsyncThunk('posts/getAll',
    async (body: { next?: number, max?: number, username?: string, category?: string }, {rejectWithValue}) => {
        try {
            const {data} = await publicApiClient.getAllPosts(body.next, body.max, body.username, body.category)
            return data
        } catch (error: any) {
            if (!error.response) {
                throw error
            }
            return rejectWithValue(error)
        }
    })

const initialState: IState<PostsDto> = {
    isLoading: false,
    response: null,
    error: null
}

const getAllPostsSlice = createSlice({
    name: 'posts/getAll',
    initialState,
    reducers: {
        resetMe: () => initialState,
        deletePostInCache: (state: IState<PostsDto>, action): void => {
            if (state.response)
                state.response.post = state.response.post.filter((item: Post): boolean => item.resourceId !== action.payload.resourceId)
        },
        addPostInsideInCache: (state: IState<PostsDto>, action): void => {
            state.response?.post.push(action.payload.post)
        },
        updatePostInsideInCache: (state: IState<PostsDto>, action): void => {
            const updatedPost: Post = action.payload.post
            state.response?.post.map((post: Post) => {
                if (post.resourceId === updatedPost.resourceId) {
                    post.title = updatedPost.title
                    post.body = updatedPost.body
                    post.categories = updatedPost.categories
                    post.tags = updatedPost.tags
                }
                return post
            })
        },
        orderPostsBy: (state: IState<PostsDto>, action): void => {
            if (action.payload.by === "title") {
                if (action.payload.order === "asc") {
                    state.response?.post.sort((a: Post, b: Post) => a.title.localeCompare(b.title))
                }else {
                    state.response?.post.sort((a: Post, b: Post) => b.title.localeCompare(a.title))
                }
            } else if (action.payload.by === "categories") {
                if (action.payload.order === "asc") {
                    state.response?.post.sort((a: Post, b: Post) => JSON.stringify(a.categories).localeCompare(JSON.stringify(b.categories)))
                }else {
                    state.response?.post.sort((a: Post, b: Post) => JSON.stringify(b.categories).localeCompare(JSON.stringify(a.categories)))
                }
            }
        },
        addCommentPostInsideInCache: (state: IState<PostsDto>, action): void => {
            const affectedComment: CommentDto = action.payload.comment
            state.response?.post.map((post: Post) => {
                if (post.resourceId === affectedComment.postId)
                    post.comments?.push(affectedComment)
                return post
            })
        },
        deleteCommentPostInsideInCache: (state: IState<PostsDto>, action): void => {
            const affectedComment: CommentDto = action.payload.comment
            state.response?.post
                .map((post: Post) => {
                    if (post.resourceId === affectedComment.postId) {
                        if (post.comments)
                            post.comments = post.comments.filter((comment: CommentDto): boolean => affectedComment.resourceId !== comment.resourceId)
                    }
                    return post
                })
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchAllPosts.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchAllPosts.fulfilled, (state, action: PayloadAction<PostsDto>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchAllPosts.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default getAllPostsSlice.reducer
export const {
    resetMe,
    deletePostInCache,
    addPostInsideInCache,
    orderPostsBy,
    updatePostInsideInCache,
    addCommentPostInsideInCache,
    deleteCommentPostInsideInCache,
} = getAllPostsSlice.actions
