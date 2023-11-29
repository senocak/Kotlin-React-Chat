import React, {useEffect, useState} from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store'
import {Categories, Category} from '../../../store/types/category'
import {ErrorResponse, IState } from '../../../store/types/global'
import App from '../../App'
import {addPostInsideCategoryInCache, fetchAllCategories} from "../../../store/features/category/getAllCategoriesSlice";
import Notification from "../../Notification"
//import { CKEditor } from '@ckeditor/ckeditor5-react'
//import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import {CreatePostDto, PostWrapperDto} from "../../../store/types/post";
import {fetchCreatePost} from "../../../store/features/post/createPostSlice";
import {addPostInsideInCache} from "../../../store/features/post/getAllPostsSlice";
import Editor from "ckeditor5-custom-build";
import {CKEditor} from "@ckeditor/ckeditor5-react";

function PostCreate(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const navigate: NavigateFunction = useNavigate()
    const getAllCategories: IState<Categories> = useAppSelector(state => state.getAllCategories)
    const createPost: IState<PostWrapperDto> = useAppSelector(state => state.createPost)
    const [title, setTitle] = useState<string>("")
    const [body, setBody] = useState<string>("")
    const [tags, setTags] = React.useState<string[]>([])
    const [categories, setCategories] = React.useState<string[]>([])
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false)
    useEffect((): void => {
        if (getAllCategories.response === null && !getAllCategories.isLoading) {
            dispatch(fetchAllCategories())
        }
    }, [getAllCategories, dispatch])
    const handleSubmit = (e: any): void => {
        e.preventDefault()
        let msg : string = ""
        let color : string = "red"
        if (!title || !body || categories.length < 1) {
            msg = "Başlık, içerik veya kategori boş olamaz"
        }
        if (categories.length > 1) {
            msg = "Çoklu Kategori Henüz Desteklenmiyor."
        }
        if (msg !== '') {
            setNotification({show: true, color: color, msg: msg});
            setTimeout((): void => {
                setNotification({show: false, color: color, msg: ""})
            }, 3000)
            return
        }
        dispatch(fetchCreatePost({title: title, body: body, category: categories, tags: tags} as CreatePostDto))
        setIsRedirecting(true)
    }
    useEffect((): void => {
        let msg : string = ""
        let color : string = ""
        if (!createPost.isLoading && createPost.response !== null && isRedirecting) {
            msg = "Yazı Eklendi."
            color = 'green'
            dispatch(addPostInsideCategoryInCache({post: createPost.response.post}))
            dispatch(addPostInsideInCache({post: createPost.response.post}))
            setTimeout((): void => {navigate('/admin/yazilar')}, 3000)
        } else if (!createPost.isLoading && createPost.error !== null && isRedirecting) {
            const error: ErrorResponse = createPost.error.response.data as ErrorResponse
            msg = error.exception.variables.map((variable: string): string => `${error.exception.error.text}<br/> ${variable}`).join('\n')
            color = 'red'
        }
        if (msg !== "") {
            setNotification({show: true, color: color, msg: msg});
            setTimeout((): void => {
                setNotification({show: false, color: color, msg: ""})
                setIsRedirecting(false)
            }, 3000)
        }
    }, [createPost, navigate, dispatch, isRedirecting])
    return <>
        <App/>
        <form onSubmit={handleSubmit} style={{maxWidth: '90%', textAlign: 'center', paddingLeft: '10%'}} >
            <input type="text" placeholder="Başlık" className="input" autoFocus required
                disabled={isRedirecting || createPost.isLoading}
                value={title} onChange={(e) => setTitle(e.target.value)}/>
            <select
                className="input"
                //TODO: multiple not supported in frontend side yet!!!
                disabled={isRedirecting || createPost.isLoading}
                onChange={(e: any): void => setCategories([...e.target.options].filter(option => option.selected).map(x => x.value))}
            >
                <option selected disabled>Kategori</option>
                { (getAllCategories.response !== null && getAllCategories.response.category.length > 0) &&
                    getAllCategories.response.category.map((category: Category) =>
                        <option value={category.slug}>{category.name}</option>
                    )
                }
            </select>
            {tags.map((tag: string) =>
                <div className="badge" style={{backgroundColor: "#0d6e9059"}}>
                    {tag}
                    <div onClick={(): void =>{setTags([...tags.filter((element: string): boolean => element !== tag)])}}>X</div>
                </div>
            )}
            <input type="text" className="input" placeholder='Etiketleri virgül(,) ile ayırınız'
                onChange={event => {
                    const inputChange: string = event.target.value
                    if (inputChange[inputChange.length - 1] === ',') {
                        setTags([...tags, inputChange.slice(0, inputChange.length - 1)])
                        event.target.value = ''
                    } 
                }}/>
            <div style={{color: "black"}}>
                {
                    //https://www.datainfinities.com/3/how-to-integrate-custom-build-ckeditor5-with-react
                }
                <CKEditor
                    editor={ Editor }
                    data={body}
                    onReady={editor => console.log( 'Editor is ready to use!', editor )}
                    onChange={(_, editor): void => setBody(editor.getData()) }
                    onBlur={(_, editor): void => console.log( 'Blur.', editor )}
                    onFocus={(_, editor): void => console.log( 'Focus.', editor )}
                />
            </div>
            <button className="input">
                Ekle
                {isRedirecting || createPost.isLoading && <i className="fas fa-spinner fa-pulse"></i>}
            </button>
        </form>
        {notification.show && <Notification color={notification.color} message={notification.msg}/>}
    </>
}
export default PostCreate