import { combineReducers } from '@reduxjs/toolkit'
import meSlice from "./features/auth/meSlice";
import getAllCategoriesSlice from "./features/category/getAllCategoriesSlice";
import getSinglePostSlice from "./features/post/getSinglePostSlice";
import addCommentSlice from "./features/post/addCommentSlice";
import loginSlice from "./features/auth/loginSlice";
import createCategorySlice from "./features/category/createCategorySlice";
import deleteCategorySlice from "./features/category/deleteCategorySlice";
import patchCategorySlice from './features/category/patchCategorySlice';
import createPostSlice from "./features/post/createPostSlice";
import getAllPostsSlice from "./features/post/getAllPostsSlice";
import deletePostSlice from "./features/post/deletePostSlice";
import patchPostSlice from "./features/post/patchPostSlice";
import patchCommentVisibilitySlice from "./features/post/patchCommentVisibilitySlice";
import getAllCommentsSlice from "./features/comment/getAllCommentsSlice";

export default combineReducers({
    me: meSlice,
    login: loginSlice,

    getAllCategories: getAllCategoriesSlice,
    addComment: addCommentSlice,
    createCategory: createCategorySlice,
    deleteCategory: deleteCategorySlice,
    patchCategory: patchCategorySlice,

    getAllPosts: getAllPostsSlice,
    getSinglePost: getSinglePostSlice,
    createPost: createPostSlice,
    deletePost: deletePostSlice,
    patchPost: patchPostSlice,
    patchCommentVisibility: patchCommentVisibilitySlice,

    getAllComments: getAllCommentsSlice,
})