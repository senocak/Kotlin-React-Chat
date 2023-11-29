import React, {useEffect, useState} from 'react'
import moment from "moment"
import {Link} from "react-router-dom"
import {Categories, Category} from "../store/types/category"
import {useAppDispatch, useAppSelector} from "../store"
import {fetchAllCategories} from "../store/features/category/getAllCategoriesSlice"
import {Post} from "../store/types/post";
import App from "./App";
import {IState} from "../store/types/global";
import {UserResponse} from "../store/types/user";

function Home(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const getAllCategories: IState<Categories> = useAppSelector(state => state.getAllCategories)
    const me: IState<UserResponse> = useAppSelector(state => state.me)
    const [inputValue, setInputValue] = useState<string>('')

    useEffect((): void => {
        if (getAllCategories.response === null && !getAllCategories.isLoading) {
            dispatch(fetchAllCategories())
        }
    }, [getAllCategories, dispatch])

    useEffect((): void => {
        const allListElements: NodeListOf<Element> = document.querySelectorAll('#myUL > li')
        allListElements
            .forEach((li: Element): string => (li as HTMLLIElement).style.display = 'none')
        Array.from(allListElements)
            .filter((li: Element) => li.textContent?.toLowerCase().includes(inputValue.toLowerCase()))
            .forEach((li: Element): string => (li as HTMLLIElement).style.display = 'block')
    }, [inputValue])

    return <>
            <App/>
            <div style={{marginRight: "auto", marginLeft: "auto", maxWidth: "70rem", marginTop: "2rem", width: "100%"}}>
                <div className="search-article">
                    <label htmlFor="search-input" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="rgba(128,128,128,0.8)" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round" className="feather feather-search" data-darkreader-inline-fill=""
                             data-darkreader-inline-stroke=""
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </label>

                    <input type="search"
                           placeholder="Yazıları arayabilirsiniz."
                           aria-label="Search"
                           id="search-input"
                           value={inputValue}
                           onChange={(e) => setInputValue(e.target.value)}
                    />
                    <ul id="search-results"></ul>
                </div>
                {
                    getAllCategories.isLoading
                        ? <i className="fas fa-spinner fa-pulse"></i>
                        :
                        getAllCategories.response?.category.map((category: Category, indexCategory: number) =>
                            <section className="posts" key={indexCategory}>
                                <h2>{category.name}</h2>
                                <ul id="myUL">
                                    {
                                        category.posts?.map((post: Post, indexPost: number) =>
                                            <li key={indexPost}>
                                                <Link to={`/yazi/${post.slug}`}>{post.title}</Link>
                                                »
                                                {
                                                    post.tags.map((tag: String, indexTag: number) =>
                                                        <span className="badge"
                                                              style={{backgroundColor: "#0d6e9059"}}
                                                              key={indexTag}
                                                        >{tag}</span>
                                                    )
                                                }
                                                »
                                                <time>
                                                    {
                                                        moment(post.createdAt * 1_000).fromNow()
                                                    }
                                                </time>
                                                »
                                                <span className="badge" style={{backgroundColor: "#ff596a42"}}>
                                                    {post.comments != undefined && post.comments.length > 0 ? post.comments?.length: 0} Yorum
                                                </span>
                                            </li>
                                        )
                                    }
                                </ul>
                            </section>
                        )
                }
            </div>
        </>
}
export default Home