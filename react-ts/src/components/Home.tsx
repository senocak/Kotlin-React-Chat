import React, {useEffect, useState} from 'react'
import {Link} from "react-router-dom"
import {useAppDispatch, useAppSelector} from "../store"
import {IState} from "../store/types/global"
import {User, UserResponse} from "../store/types/user"
import Notification from "./Notification";

function Home(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const me: IState<UserResponse> = useAppSelector(state => state.me)
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    const [selectedFriend, setSelectedFriend] = useState<User|null>(null)

    //useEffect((): void => {
    //    if (getAllCategories.response === null && !getAllCategories.isLoading) {
    //        dispatch(fetchAllCategories())
    //    }
    //}, [getAllCategories, dispatch])
//
    //useEffect((): void => {
    //    const allListElements: NodeListOf<Element> = document.querySelectorAll('#myUL > li')
    //    allListElements
    //        .forEach((li: Element): string => (li as HTMLLIElement).style.display = 'none')
    //    Array.from(allListElements)
    //        .filter((li: Element) => li.textContent?.toLowerCase().includes(inputValue.toLowerCase()))
    //        .forEach((li: Element): string => (li as HTMLLIElement).style.display = 'block')
    //}, [inputValue])

    return <>
            <div className="conversation-list">
                <ul className="">
                    <li className="friend active"><i className="fa fa-list-alt"></i><span>Arkadaşlar</span></li>
                    <li className="friend input"><input type="search" placeholder="Arkadaş ara..."/></li>
                    {
                        (me.response !== null && !me.isLoading) && me.response.user.friends.map(friend =>
                            <li className='friend'
                                onClick={(): void => {
                                    if (friend.status === "Pending") {
                                        setNotification({show: true, color: 'red', msg: 'İstek beklemede'})
                                        setTimeout((): void => {
                                            setNotification({show: false, color: '', msg: ""})
                                        }, 3000)
                                        setSelectedFriend(null)
                                        return
                                    }
                                    setSelectedFriend(friend.owner.email === me.response?.user.email ? friend.person : friend.owner)
                                }}
                            >
                                <i style={{color: "green"}} className="fa-regular fa-circle"></i>
                                <span style={{textDecoration: friend.status === "Pending" ? 'line-through': 'none'}}>
                                    {
                                        friend.owner.email === me.response?.user.email ? friend.person.name : friend.owner.email
                                    }
                                </span>
                            </li>
                        )
                    }
                </ul>
                <Link to='/profile'>
                    <div className="my-account">
                        <div className="image">
                            <img src="https://secure.gravatar.com/avatar/de76e03aa6b5b0bf675c1e8a990da52f?s=64"  alt={me.response?.user.name}/>
                            <i className="fa fa-circle online"></i>
                        </div>
                        <div className="name">
                            <span>{me.response?.user.name}</span>
                            <i className="fa fa-angle-down"></i>
                            <span className="availability">Available</span>
                        </div>
                    </div>
                </Link>
            </div>
            {selectedFriend !== null && <>
                <div className="chat-area">
                    <div className="title">
                        <b>
                            {selectedFriend.name}<sup style={{float: 'right'}}>{me.response?.user.email}</sup>
                        </b>
                    </div>
                    <div className="chat-list">
                        <ul>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Hey, do you like the new interface? It's done with Font Awesome.</p>
                                    <span className="msg-time">5:00 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p><span className="blue-label">Cucu Ionel</span> I see what you did there.</p>
                                    <span className="msg-time">5:01 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Feel free to look at the code if you want.</p>
                                    <span className="msg-time">5:02 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>Yeah, will do.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>This is an example text reply.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>I know, put some more.</p>
                                    <span className="msg-time">5:06 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Here is another line.</p>
                                    <span className="msg-time">5:06 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>Yeah, will do.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Feel free to look at the code if you want.</p>
                                    <span className="msg-time">5:02 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>Yeah, will do.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                            <li className="me">
                                <div className="name">
                                    <span className="">Cucu Ionel</span>
                                </div>
                                <div className="message">
                                    <p>Feel free to look at the code if you want.</p>
                                    <span className="msg-time">5:02 pm</span>
                                </div>
                            </li>
                            <li className="">
                                <div className="name">
                                    <span className="">Christian Smith</span>
                                </div>
                                <div className="message">
                                    <p>Yeah, will do.</p>
                                    <span className="msg-time">5:04 pm</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="input-area">
                        <div className="input-wrapper">
                            <input type="text" value="" />
                            <i className="fa fa-smile-o"></i>
                            <i className="fa fa-paperclip"></i>
                        </div>
                        <input type="button" value="Submit" className="send-btn" />
                    </div>
                </div>
                <div className="right-tabs">
                    <ul className="tabs">
                        <li><a href="#"><i className="fa fa-user"></i></a></li>
                        <li className="active"><a href="#"><i className="fa fa-users"></i></a></li>
                        <li><a href="#"><i className="fa fa-link"></i></a></li>
                    </ul>
                    <ul className="tabs-container">
                        <li className="active">
                            <ul className="member-list">
                                <li><input type="search" placeholder="Arkadaş ara..."/></li>
                                <li><i style={{color: "green"}} className="fa-regular fa-circle"></i> <span>Cucu Ionel</span></li>
                                <li><i style={{color: "gray"}} className="fa-regular fa-circle"></i> <span>Christian Smith</span></li>
                                <li><i style={{color: "red"}} className="fa-regular fa-circle"></i> <span>John Bradley</span><span className="time">10:45 pm</span></li>
                                <li><i style={{color: "red"}} className="fa-regular fa-circle"></i> <span>Daniel Freitz</span></li>
                            </ul>
                        </li>
                        <li></li>
                        <li></li>
                    </ul>
                    <i className="fa fa-cog"></i>
                </div>
            </>}
            {notification.show && <Notification color={notification.color} message={notification.msg}/>}
        </>
}
export default Home