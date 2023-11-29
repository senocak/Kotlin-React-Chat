import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import App from "./App"
import {useAppDispatch, useAppSelector} from "../store"
import {PostWrapperDto} from "../store/types/post"
import {fetchGetSingle} from "../store/features/post/getSinglePostSlice"
import moment from "moment"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import {fetchPostComment} from "../store/features/post/addCommentSlice"
import {IState} from "../store/types/global"
import {CommentWrapperDto} from "../store/types/comment"
import Captcha from "./Captcha";
import {generateRandom} from "../utils";

interface YaziParams {
    slug: string;
}
function YaziDetay(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const params = useParams()
    const { slug }: YaziParams = params as unknown as YaziParams

    const getSinglePost: IState<PostWrapperDto> = useAppSelector(state => state.getSinglePost)
    const addComment: IState<CommentWrapperDto> = useAppSelector(state => state.addComment)

    useEffect((): void => {
        if ((getSinglePost.response === null && !getSinglePost.isLoading) || (getSinglePost.response !== null && slug !== getSinglePost.response.post.slug)) {
            dispatch(fetchGetSingle(slug))
        }
    }, [getSinglePost, dispatch])
    useEffect(() => {
        if (addComment.response !== null && !addComment.isLoading) {
            alert("Yorumunuz onaylandıktan sonra gösterilecektir.")
        }
    }, [addComment, dispatch])
    useEffect((): void => {
        Prism.highlightAll()
    }, [])

    const [enteredVal, setEnteredVal] = useState<string>("")
    const [text, setText] = useState<string>(generateRandom())
    const handleSubmit = (e: any) => {
        e.preventDefault()
        const nameVal = e.target[0].value.trim()
        const emailVal = e.target[1].value.trim()
        const bodyVal = e.target[2].value.trim()
        if (!nameVal || !emailVal || !bodyVal) {
            alert("İsim, email ve yorum boş olamaz")
            return
        }
        if (enteredVal.toUpperCase() !== text.toUpperCase()) {
            setEnteredVal("")
            alert("Captcha not valid")
        }
        dispatch(fetchPostComment({body: {name: nameVal, email: emailVal, body: bodyVal,}, slug: getSinglePost.response!.post.slug}))
        e.target[0].value = ''
        e.target[1].value = ''
        e.target[2].value = ''
        return
    }
    return <>
        <App/>
        {
            (getSinglePost.isLoading || getSinglePost.response === null) ? <i className="fas fa-spinner fa-pulse"></i> :
            <main id='mainDiv'>
                <section className="post" style={{padding: '2.4rem 2rem'}}>
                    <time>
                        {
                            moment(getSinglePost.response!.post.createdAt * 1_000).fromNow()
                        }
                    </time>
                    <h1 className="title">{getSinglePost.response?.post.title}</h1>
                    <span className="meta">
                        {
                            getSinglePost.response!.post.tags.map((tag: String, indexTag: number) =>
                                <a href={`#${indexTag}`} className="badge" style={{backgroundColor: "#0d6e9059"}} key={indexTag}>{tag}</a>
                            )
                        }
                    </span>
                    <div dangerouslySetInnerHTML={{__html: getSinglePost.response!.post.body}} />
                </section>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="İsminiz" className="input" required/>
                    <input type="email" placeholder="Email" className="input" required/>
                    <input type="text" placeholder="Yorumunuz..." className="input" required/>
                    <Captcha
                        text={text}
                        width={100}
                        height={50}
                        fontSize={20}
                        onClick={(): void => {
                            setText(generateRandom())
                            setEnteredVal("")
                        }}/>
                    <input type="text" placeholder="Captcha" value={enteredVal} className='input' required
                           onChange={(e) => {setEnteredVal(e.target.value)}}/>
                    <input type="submit" value="Gönder" className="input" />
                </form>
                {
                    (getSinglePost.response.post.comments !== null && getSinglePost.response.post.comments !== undefined && getSinglePost.response.post.comments!.length > 0) &&
                    <>
                        {getSinglePost.response.post.comments!.map((comment, key: number) =>
                            <div key={key}
                                 style={{
                                     visibility: comment.approved ? "visible": 'hidden',
                                     position: "relative",
                                     height: 'auto',
                                     margin: '10px 0',
                                     padding: '5px',
                                     backgroundColor: '#DADADA',
                                     borderRadius: '3px',
                                     border: '5px solid'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    background: 'transparent',
                                    border: '10px solid #ccc',
                                    left: '-25px',
                                    borderTopColor: 'transparent',
                                    borderLeftColor: 'transparent',
                                    borderBottomColor: 'transparent'}}></span>
                                <div style={{color: 'black'}}>
                                    {comment.name}: {comment.body}<sup style={{float: 'right'}}>{moment(comment.createdAt * 1_000).fromNow()}</sup>
                                </div>
                            </div>
                        )}
                    </>
                }
            </main>
        }
    </>
}
export default YaziDetay