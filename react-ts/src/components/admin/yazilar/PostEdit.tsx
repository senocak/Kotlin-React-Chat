import React, {useEffect, useState} from 'react'
import {NavigateFunction, useNavigate, useParams} from "react-router-dom"
import {useAppDispatch, useAppSelector} from "../../../store"
import {ErrorResponse, IState} from "../../../store/types/global"
import {Post, PostsDto, PostUpdateDto, PostWrapperDto} from "../../../store/types/post"
import {fetchAllPosts, updatePostInsideInCache} from "../../../store/features/post/getAllPostsSlice"
import App from "../../App"
import {Role, UserResponse} from "../../../store/types/user"
import Notification from "../../Notification"
import {Categories, Category} from "../../../store/types/category"
import {
    fetchAllCategories,
    updatePostInsideCategoryInCache
} from "../../../store/features/category/getAllCategoriesSlice"
import {arraysEqualIgnoreOrder} from "../../../utils"
import {fetchUpdatePost} from "../../../store/features/post/patchPostSlice"
import {CKEditor} from "@ckeditor/ckeditor5-react"
import Editor from "ckeditor5-custom-build";

function PostEdit(): React.JSX.Element {
    const params = useParams()
    const {slug} = params as unknown as { slug: string }
    const dispatch = useAppDispatch()
    const me: IState<UserResponse> = useAppSelector(state => state.me)
    const getAllCategories: IState<Categories> = useAppSelector(state => state.getAllCategories)
    const getAllPosts: IState<PostsDto> = useAppSelector(state => state.getAllPosts)
    const patchPost: IState<PostWrapperDto> = useAppSelector(state => state.patchPost)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const [title, setTitle] = useState<string>('')
    const [body, setBody] = useState<string>('')
    const [tags, setTags] = React.useState<string[]>([])
    const [categories, setCategories] = React.useState<string[]>([])
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false)
    const navigate: NavigateFunction = useNavigate()
    useEffect((): void => {
        if (getAllPosts.response === null && !getAllPosts.isLoading) {
            dispatch(fetchAllPosts({}))
        }
    }, [getAllPosts, dispatch])
    useEffect((): void => {
        if (getAllCategories.response === null && !getAllCategories.isLoading) {
            dispatch(fetchAllCategories())
        }
    }, [getAllCategories, dispatch])
    useEffect((): void => {
        if (getAllPosts.response !== null && !getAllPosts.isLoading) {
            const post: Post = getAllPosts.response.post.filter((item: Post): boolean => item.slug === slug)[0]
            if (me.response?.user.username !== post.user.username && me.response!.user.roles.some((e: Role): boolean => e.name === 'USER')) {
                console.error("Geçersiz Kullanıcı")
                navigate("/admin/yazilar")
            }
            setTitle(post.title)
            setBody(post.body)
            setTags(post.tags)
            setCategories(post.categories.map((category)=>category.name))
            setSelectedPost(post)
        }
    }, [getAllPosts, slug])
    const handleSubmit = (e: any): void => {
        e.preventDefault()
        let msg : string = ""
        let color : string = "red"
        if (!title || !body || categories.length < 1)
            msg = "Başlık, içerik veya kategori boş olamaz"
        if (categories.length > 1)
            msg = "Çoklu Kategori Henüz Desteklenmiyor."
        if (msg !== '') {
            setNotification({show: true, color: color, msg: msg});
            setTimeout((): void => {
                setNotification({show: false, color: color, msg: ""})
            }, 3000)
            return
        }
        const data: PostUpdateDto = {}
        if (title !== selectedPost!.title)
            data.title = title
        if (body !== selectedPost!.body)
            data.body = body
        if (!selectedPost!.categories.some((category: Category) => categories.some((cat: string): boolean => cat === category.name)))
            data.category = categories
        if (tags !== null && tags.length > 0 && !arraysEqualIgnoreOrder(tags, selectedPost!.tags))
            data.tags = tags
        dispatch(fetchUpdatePost({slug: slug, dto: data}))
        setIsRedirecting(true)
    }
    useEffect((): void => {
        let msg : string = ""
        let color : string = ""
        if (!patchPost.isLoading && patchPost.response !== null && isRedirecting) {
            msg = `Yazı Güncellendi.<br/>${slug}`
            color = 'green'
            dispatch(updatePostInsideInCache({post: patchPost.response.post}))
            dispatch(updatePostInsideCategoryInCache({post: patchPost.response.post}))
            setTimeout((): void => {navigate('/admin/yazilar')}, 3000)
        } else if (!patchPost.isLoading && patchPost.error !== null && isRedirecting) {
            const error: ErrorResponse = patchPost.error.response.data as ErrorResponse
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
    }, [patchPost, navigate, dispatch, isRedirecting])
    const toolbarSettings = {
        items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
            'FontName', 'FontSize', 'FontColor', 'BackgroundColor',
            'LowerCase', 'UpperCase', '|',
            'Formats', 'Alignments', 'OrderedList', 'UnorderedList',
            'Outdent', 'Indent', '|',
            'CreateLink', 'Image', '|', 'ClearFormat', 'Print',
            'SourceCode', 'FullScreen', '|', 'Undo', 'Redo']
    };
    return <>
            <App/>
            <form onSubmit={handleSubmit}
                style={{maxWidth: '90%', textAlign: 'center', paddingLeft: '10%'}} >
                <input type="text" placeholder="Başlık" className="input" autoFocus required
                       disabled={isRedirecting || patchPost.isLoading}
                       value={title} onChange={(e) => setTitle(e.target.value)}/>
                <select
                    className="input"
                    //TODO: multiple not supported in frontend side yet!!!
                    disabled={isRedirecting || patchPost.isLoading}
                    onChange={(e: any): void => setCategories([...e.target.options].filter(option => option.selected).map(x => x.value))}
                >
                    { (getAllCategories.response !== null && getAllCategories.response.category.length > 0) &&
                        getAllCategories.response.category.map((category: Category) =>
                            <option value={category.slug} selected={selectedPost?.categories.some((e: Category): boolean => e.name === category.name)}>{category.name}</option>
                        )
                    }
                </select>
                {tags.map((tag: string) =>
                    <div className="badge" style={{backgroundColor: "#0d6e9059"}}>
                        {tag}
                        <div onClick={(): void =>{setTags([...tags.filter((element: string): boolean => element !== tag)])}}>X</div>
                    </div>
                )}
                <input type="text"
                       className="input" placeholder='Etiketleri virgül(,) ile ayırınız'
                       onChange={event => {
                           const inputChange: string = event.target.value
                           if (inputChange[inputChange.length - 1] === ',') {
                               setTags([...tags, inputChange.slice(0, inputChange.length - 1)])
                               event.target.value = ''
                           }
                       }}/>
                <div style={{color: "black"}}>
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
                    Güncelle
                    {isRedirecting || patchPost.isLoading && <i className="fas fa-spinner fa-pulse"></i>}
                </button>
            </form>
            {JSON.stringify(selectedPost?.comments)}
            {notification.show && <Notification color={notification.color} message={notification.msg}/>}
        </>
}
export default PostEdit