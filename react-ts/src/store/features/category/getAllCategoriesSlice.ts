import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Categories, Category} from "../../types/category";
import PublicApiClient from "../../../utils/http-client/PublicApiClient";
import {IState} from '../../types/global';
import {Post} from "../../types/post";

const publicApiClient: PublicApiClient = PublicApiClient.getInstance()

export const fetchAllCategories = createAsyncThunk('category/getAll',
    async (_: void, {rejectWithValue}) => {
        try {
            const {data} = await publicApiClient.getCategories()
            return data
        } catch (error: any) {
            if (!error.response) {
                throw error
            }

            return rejectWithValue(error)
        }
    })

const initialState: IState<Categories> = {
    isLoading: false,
    response: null,
    error: null
}

const findItem = (categories: Categories, resourceId: string): Category | null => {
    for (let i: number = 0; i < categories.category.length; i++) {
        if (categories.category[i].resourceId === resourceId) {
            return categories.category[i]
        }
    }
    return null
}

const getAllCategoriesSlice = createSlice({
    name: 'category/getAll',
    initialState,
    reducers: {
        resetMe: () => initialState,
        deleteCategoryInCache: (state: IState<Categories>, action): void => {
            if (state.response)
                state.response!.category = state.response!.category.filter((item: Category): boolean => item.resourceId !== action.payload.resourceId)
        },
        addCategoryInCache: (state: IState<Categories>, action): void => {
            state.response?.category.push(action.payload.category)
        },
        updateCategoryInCache: (state: IState<Categories>, action): void => {
            state.response?.category.map((category: Category) => {
                if (category.resourceId === action.payload.category.resourceId) {
                    category.name = action.payload.category.name
                    category.image = action.payload.category.image
                }
                return category
            })
        },
        addPostInsideCategoryInCache: (state: IState<Categories>, action): void => {
            state.response?.category.map((category: Category) => {
                if (category.resourceId === action.payload.post.categories[0].resourceId) {
                    category.posts?.push(action.payload.post)
                }
                return category
            })
        },
        updatePostInsideCategoryInCache: (state: IState<Categories>, action): void => {
            const updatedPost: Post = action.payload.post
            state.response?.category.map((category: Category) => {
                category.posts?.map((post: Post) => {
                    if (post.resourceId === updatedPost.resourceId) {
                        post.title = updatedPost.title
                        post.body = updatedPost.body
                        post.categories = updatedPost.categories
                        post.tags = updatedPost.tags
                    }
                    return post
                })
                return category
            })
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchAllCategories.pending, state => {
            state.isLoading = true
            state.response = null
            state.error = null
        })

        builder.addCase(fetchAllCategories.fulfilled, (state, action: PayloadAction<Categories>) => {
            state.isLoading = false
            state.response = action.payload
            state.error = null
        })

        builder.addCase(fetchAllCategories.rejected, (state, action) => {
            state.isLoading = false
            state.response = null
            state.error = action.payload
        })
    }
})

export default getAllCategoriesSlice.reducer
export const {
    resetMe,
    deleteCategoryInCache,
    addCategoryInCache,
    updateCategoryInCache,
    addPostInsideCategoryInCache,
    updatePostInsideCategoryInCache,
} = getAllCategoriesSlice.actions
