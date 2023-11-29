import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../../store'
import {ErrorResponse, IState} from '../../../store/types/global'
import App from '../../App'
import Notification from "../../Notification"
import {Post, PostsDto} from "../../../store/types/post"
import {Role, UserResponse } from '../../../store/types/user'
import {deletePostInCache, fetchAllPosts, orderPostsBy} from "../../../store/features/post/getAllPostsSlice"
import {Category} from "../../../store/types/category"
import {fetchDeletePost} from "../../../store/features/post/deletePostSlice"

function AllPosts(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const me: IState<UserResponse> = useAppSelector(state => state.me)
    const getAllPosts: IState<PostsDto> = useAppSelector(state => state.getAllPosts)
    const deletePost: IState<null> = useAppSelector(state => state.deletePost)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    const initialState: { by: string; order: string } = {by: '', order: "asc"}
    const [orderSort, setOrderSort] = useState(initialState)

    useEffect((): void => {
        if (getAllPosts.response === null && !getAllPosts.isLoading) {
            dispatch(fetchAllPosts({}))
        }
    }, [getAllPosts, dispatch])
    const delPost = (post: Post): void => {
        if (me.response!.user.username !== post.user.username && me.response!.user.roles.some((e: Role): boolean => e.name === 'USER')) {
            setNotification({show: true, color: 'red', msg: "Geçersiz İşlem"})
            setTimeout((): void => {
                setNotification({show: false, color: '', msg: ''})
            }, 3000)
            return
        }
        setSelectedPost(post)
        if (window.confirm("Emin misin?")) {
            dispatch(fetchDeletePost(post.slug))
        }
    }
    useEffect((): void => {
        let msg : string = ""
        let color : string = ""
        if (deletePost.response !== null && !deletePost.isLoading && selectedPost) {
            dispatch(deletePostInCache({resourceId: selectedPost.resourceId}))
            setSelectedPost(null)
            msg = `Yazı Silindi.<br/>${selectedPost.title}`
            color = 'green'
        } else if (!deletePost.isLoading && deletePost.error !== null) {
            const error: ErrorResponse = deletePost.error.response.data as ErrorResponse
            msg = error.exception.variables.map((variable: string): string => `${error.exception.error.text}<br/> ${variable}`).join('\n')
            color = 'red'
        }
        if (msg !== "") {
            setNotification({show: true, color: color, msg: msg})
            setTimeout((): void => {
                setNotification({show: false, color: color, msg: ""})
            }, 3000)
        }
    }, [deletePost, selectedPost, dispatch])
    return <>
        <App/>
        <main style={{maxWidth: '80%'}}>
            <Link to={`/admin/yazilar/ekle`} className="input" style={{textAlign: 'center'}}>Ekle</Link>
            <table className="fixed_headers">
                <thead>
                <tr>
                    <th onClick={(): void => {
                        setOrderSort(initialState)
                        const tempState: { by: string; order: string } = {by: 'categories', order: orderSort.order === 'asc' ? 'desc' : 'asc'}
                        setOrderSort(tempState)
                        dispatch(orderPostsBy(tempState))
                    }}>Kategori {orderSort.by === 'categories' && <i className={`fa-solid fa-sort-${orderSort.order === 'desc' ? 'up' : 'down'}`}></i>}</th>
                    <th onClick={(): void => {
                        setOrderSort(initialState)
                        const tempState: { by: string; order: string } = {by: 'title', order: orderSort.order === 'asc' ? 'desc' : 'asc'}
                        setOrderSort(tempState)
                        dispatch(orderPostsBy(tempState))
                    }}>İsim {orderSort.by === 'title' && <i className={`fa-solid fa-sort-${orderSort.order === 'desc' ? 'up' : 'down'}`}></i>}</th>
                    <th>Yorum</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {
                    (getAllPosts.response !== null && getAllPosts.response.post.length > 0) &&
                    getAllPosts.response.post.map((post: Post) =>
                        <tr key={post.slug}>
                            <td>
                                {
                                    post.categories.map((category: Category, indexCategory: number) =>
                                        <p className="badge" style={{backgroundColor: "#0d6e9059"}} key={indexCategory}>{category.name}</p>
                                    )
                                }
                            </td>
                            <td>
                                {post.title}
                                {
                                    post.tags.map((tag: String, indexTag: number) =>
                                        <a href={`#${indexTag}`} className="badge" style={{backgroundColor: "#0d6e9059"}} key={indexTag}>{tag}</a>
                                    )
                                }
                            </td>
                            <td>{(post.comments && post.comments!.length > 0) ? post.comments!.length: '0'}</td>
                            <td style={{float: 'right', color: 'red'}}>
                                {(me.response?.user.username === post.user.username || me.response!.user.roles.some((e: Role): boolean => e.name === 'ADMIN')) &&
                                    <>
                                        <Link to={`/admin/yazilar/${post.slug}`} className="fa-solid fa-pen-to-square" style={{color: 'white'}}/>
                                        <i className="fa-solid fa-trash-can" style={{float: 'right', color: 'red'}} onClick={(): void => delPost(post)}></i>
                                    </>
                                }
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </main>
        {notification.show && <Notification color={notification.color} message={notification.msg}/>}
    </>
}

export default AllPosts