import React, {useEffect, useState} from 'react'
import App from "../App"
import Notification from "../Notification"
import {useAppDispatch, useAppSelector} from "../../store"
import {IState} from "../../store/types/global"
import {CommentDto, CommentListDto, CommentWrapperDto} from "../../store/types/comment"
import {changeVisibility, fetchAllComments} from "../../store/features/comment/getAllCommentsSlice"
import {Post, PostsDto} from "../../store/types/post"
import {
    addCommentPostInsideInCache,
    deleteCommentPostInsideInCache,
    fetchAllPosts
} from "../../store/features/post/getAllPostsSlice"
import {
    fetchUpdateCommentVisible
} from "../../store/features/post/patchCommentVisibilitySlice"

function AllComments(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const getAllComments: IState<CommentListDto> = useAppSelector(state => state.getAllComments)
    const patchCommentVisibility: IState<CommentWrapperDto> = useAppSelector(state => state.patchCommentVisibility)
    const [selectedComment, setSelectedComment] = useState<CommentDto | null>(null)
    const getAllPosts: IState<PostsDto> = useAppSelector(state => state.getAllPosts)
    const [notification, setNotification] = useState({show: false, color: "", msg: ""})
    useEffect((): void => {
        if (getAllComments.response === null && !getAllComments.isLoading) {
            dispatch(fetchAllComments())
        }
    }, [getAllComments, dispatch])
    useEffect((): void => {
        if (getAllPosts.response === null && !getAllPosts.isLoading) {
            dispatch(fetchAllPosts({}))
        }
    }, [getAllPosts, dispatch])
    const changeVisible = (slug: string, comment: CommentDto) => {
        setSelectedComment(comment)
        dispatch(fetchUpdateCommentVisible({slug: slug, commentId: comment.resourceId, approve: !comment.approved}))
    }
    const getPost = (postId: string): Post | undefined =>
        getAllPosts.response?.post.find((post: Post): boolean => post.resourceId === postId)
    useEffect((): void => {
        if (!patchCommentVisibility.isLoading && patchCommentVisibility.response !== null && selectedComment) {
            const updatedComment: CommentDto = patchCommentVisibility.response.comment
            dispatch(changeVisibility({comment: updatedComment}))
            if (updatedComment.approved)
                dispatch(addCommentPostInsideInCache({comment: updatedComment}))
            else
                dispatch(deleteCommentPostInsideInCache({comment: updatedComment}))
            setNotification({show: true, color: 'green', msg: `Yorum ${updatedComment.approved ? '': 'De-'}Aktifleşti`})
            setTimeout((): void => {setNotification({show: false, color: '', msg: ""})}, 3000)
        }
    }, [patchCommentVisibility, selectedComment, dispatch]);
    return <>
            <App/>
            <main style={{maxWidth: '70rem'}}>
                <table className="fixed_headers">
                    <thead>
                    <tr>
                        <th>Yazı</th>
                        <th>Email</th>
                        <th>Mesaj</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        getAllComments.response !== null && getAllComments.response.comment?.map((comment: CommentDto) =>
                            <>
                                <tr key={comment.resourceId}>
                                    <td>{getPost(comment.postId)?.title}</td>
                                    <td>{comment.email}</td>
                                    <td>{comment.name}</td>
                                    <td>
                                        <i className={`fa-solid fa-toggle-${comment.approved ? 'on' : 'off'}`}
                                           onClick={(): void => {
                                               const post: Post | undefined = getPost(comment.postId)
                                               if (post === undefined) {
                                                   return
                                               }
                                               changeVisible(post.slug, comment)
                                           }}></i>
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </main>
            {notification.show && <Notification color={notification.color} message={notification.msg}/>}
        </>
}

export default AllComments