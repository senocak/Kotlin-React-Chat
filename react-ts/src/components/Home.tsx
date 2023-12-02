import React, {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from "../store"
import {IPagination, IState} from "../store/types/global"
import {Friend, User, UserPaginationDTO} from "../store/types/user"
import Notification from "./Notification"
import EmojiPicker, {EmojiClickData} from "emoji-picker-react"
import {fetchBlockUnblockFriend} from "../store/features/patchBlockUnblockFriendSlice"
import {updateFriendsInContext} from "../store/features/auth/meSlice"
import {fetchGetAllUsers} from "../store/features/getAllUsersSlice"

function Home(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const me: IState<User> = useAppSelector(state => state.me)
    const patchBlockUnblockFriend: IState<User> = useAppSelector(state => state.patchBlockUnblockFriend)
    const getAllUsers: IState<UserPaginationDTO> = useAppSelector(state => state.getAllUsers)
    const putFriend: IState<User> = useAppSelector(state => state.putFriendSlice)
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    const [selectedFriend, setSelectedFriend] = useState<Friend |null>(null)
    const [selectedTab, setSelectedTab] = useState<string>('')
    const [msg, setMsg] = useState<string>('')
    const [showPicker, setShowPicker] = useState<boolean>(false)
    const [allUsers, setAllUsers] = useState<User[] |null>(null)

    const defaultPagination : IPagination = {
        page: 1,
        size: 20,
        sortBy: "id",
        sort: "asc",
        q: null
    }
    const [pagination, setPagination] = useState<IPagination>(defaultPagination)
    const [q, setQ] = useState<string>('')

    useEffect((): void => {
        if (patchBlockUnblockFriend.response !== null && !patchBlockUnblockFriend.isLoading) {
            const friends: Friend[] = patchBlockUnblockFriend.response.friends
            dispatch(updateFriendsInContext({friends: friends}))
            const userFromFriend: User = getUserFromFriend(selectedFriend!)
            const find: Friend | undefined = friends.find((f: Friend) => f.owner.email === userFromFriend.email || f.person.email === userFromFriend.email)
            if (find)
                setSelectedFriend(find)
        } else if (patchBlockUnblockFriend.error) {
            const exception = patchBlockUnblockFriend.error.response.data.exception
            let message: string = `${exception.error.id}: ${exception.error.text}`
            exception.variables.forEach((variable: string): string => message = `${message}</br>${variable}`)
            setNotification({show: true, color: 'red', msg: `${message}`})
            setTimeout((): void => {
                setNotification({show: false, color: '', msg: ''})
            }, 3000)
        }
    }, [patchBlockUnblockFriend, dispatch])
    useEffect((): void => {
        if (getAllUsers.response === null && !getAllUsers.isLoading) {
            dispatch(fetchGetAllUsers(pagination))
        } else if (getAllUsers.response !== null && !getAllUsers.isLoading) {
            if (allUsers === null) {
                setAllUsers(getAllUsers.response!.items)
            } else {
                setAllUsers([...allUsers, ...getAllUsers.response.items])
            }
        }
    }, [getAllUsers, dispatch])
    const getUserFromFriend = (friend: Friend): User => friend.owner?.email === me.response?.email ? friend.person : friend.owner

    return <>
            <div className="window-area">
                <div className="conversation-list">
                    <ul className="">
                        <li className="friend"><input className="input" type="search" placeholder="Arkadaşlarımı ara..."/></li>
                        {
                            (me.response !== null && !me.isLoading) && me.response.friends.map((friend: Friend) =>
                                <li
                                    className={
                                        `friend ${
                                            selectedFriend !== null &&
                                            (getUserFromFriend(selectedFriend!)?.email === friend.owner.email ||
                                            getUserFromFriend(selectedFriend!)?.email === friend.person.email) ? 'active' : ''}`}
                                    onClick={(): void => {
                                        setSelectedTab('profile')
                                        setSelectedFriend(friend)
                                    }}
                                >
                                   <img
                                       src={getUserFromFriend(friend)?.picture}
                                       alt={getUserFromFriend(friend)?.name}
                                       style={{
                                           width: '25px',
                                           borderRadius: '100px',
                                           border: friend.blockedAt
                                               ? (friend.status !== "Accepted")
                                                   ? "2px solid yellow"
                                                   : "2px solid gray"
                                               : (friend.status !== "Accepted")
                                                   ? "2px solid red"
                                                   : "2px solid green"

                                       }}/>
                                    <span>{getUserFromFriend(friend).name}</span>
                                </li>
                            )
                        }
                    </ul>
                    selectedTab:{selectedTab}
                    <div className="my-account" onClick={() => setSelectedTab('settings')}>
                        <div className="image">
                            <img src={me.response?.picture} alt={me.response?.name}/>
                            <i className="fa fa-circle online"></i>
                        </div>
                        <div className="name">
                            <span>{me.response?.name}</span>
                            <span className="availability">Available</span>
                        </div>
                    </div>
                </div>
                {selectedFriend !== null && <>
                    <div className="chat-area">
                        <div className="title">
                            <b>
                                {getUserFromFriend(selectedFriend).name}<sup style={{float: 'right'}}>{selectedFriend.status}</sup>
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
                                <textarea
                                    disabled={selectedFriend.status !== "Accepted" || selectedFriend.blockedAt !== undefined}
                                    className="input"
                                    style={{resize: 'none', fontSize: 'xx-large'}}
                                    rows={2}
                                    onKeyDown={
                                        (e) => {
                                            if(e.key == "Enter" && e.shiftKey) {
                                                e.preventDefault()
                                                alert(msg)
                                            }
                                        }
                                    }
                                    onChange={(e) => setMsg(e.target.value)}
                                    value={msg}
                                    placeholder={getUserFromFriend(selectedFriend).name + "'e mesaj yaz"}
                                />
                                {(selectedFriend.status === "Accepted" && selectedFriend.blockedAt === undefined) &&
                                    <>
                                        <i className="fa-solid fa-paperclip"></i>
                                        <i className="fa-solid fa-icons" onClick={() => setShowPicker((val) => !val)}></i>
                                    </>
                                }
                            </div>
                            {showPicker && (
                                <EmojiPicker
                                    onEmojiClick={(emojiObject: EmojiClickData) => {
                                        setMsg((prevInput: string) => prevInput + emojiObject.emoji)
                                        setShowPicker(false)
                                    }}
                                    width="100%"
                                />
                            )}
                        </div>
                    </div>
                    <div className="right-tabs">
                        <ul className="tabs">
                            <li onClick={() => setSelectedTab('profile')} className={selectedTab === 'profile' ? 'active': ''}><a href="#"><i className="fa fa-user"></i></a></li>
                            <li onClick={() => setSelectedTab('allFriends')} className={selectedTab === 'allFriends' ? 'active': ''}><a href="#"><i className="fa fa-users"></i></a></li>
                            <li onClick={() => setSelectedTab('settings')} className={selectedTab === 'settings' ? 'active': ''}><a href="#"><i className="fa fa-cog"></i></a></li>
                        </ul>
                        {selectedTab === 'profile' &&
                            <>
                                <header style={{textAlign: 'center'}}>
                                    <img src={getUserFromFriend(selectedFriend).picture} style={{width: '75px'}} alt={getUserFromFriend(selectedFriend).name}/>
                                    <h1>{getUserFromFriend(selectedFriend).name}</h1>
                                    <h2>{getUserFromFriend(selectedFriend).email}</h2>
                                </header>
                                <br/>
                                <ul className="member-list">
                                    <li><i style={{color: "red"}} className="fa-regular fa-circle"></i> <span>Online / Offline</span></li>
                                    {
                                        selectedFriend.status === "Accepted"
                                            ? <li><i className="fa-solid fa-user-xmark"></i> Arkadaşlıktan çıkar</li>
                                            : getUserFromFriend(selectedFriend).email === me.response?.email
                                                ? <li><i className="fa-solid fa-user-xmark"></i> İsteği iptal et</li>
                                                : <li><i className="fa-solid fa-user-xmark"></i> İsteği kabul et</li>
                                    }
                                    {
                                        !selectedFriend.blockedAt
                                            ?
                                                <li onClick={() => dispatch(fetchBlockUnblockFriend({email: getUserFromFriend(selectedFriend).email, operation: 'block'}))}>
                                                    <i className="fa-solid fa-user-large-slash"></i> Engelle
                                                </li>
                                            :
                                            <>
                                                { selectedFriend.blockedBy?.email === me.response?.email
                                                    ?
                                                        <li onClick={() => dispatch(fetchBlockUnblockFriend({email: getUserFromFriend(selectedFriend).email, operation: 'unblock'}))}>
                                                            <i className="fa-solid fa-user-xmark"></i> Engel kaldır
                                                        </li>
                                                    :
                                                        <li><i className="fa-solid fa-user-xmark"></i> Engellendin</li>
                                                }
                                                <li><span className="time">Engel tarihi: {selectedFriend.blockedAt}</span></li>
                                            </>
                                    }
                                    {
                                        selectedFriend.status === "Accepted" && <li><span className="time">Kabul tarihi: {selectedFriend.approvedAt}</span></li>
                                    }
                                    <li><span className="time">Son giriş: 10:45 pm</span></li>
                                    <li><span className="time"></span></li>
                                </ul>
                            </>
                        }
                        {selectedTab === 'allFriends' &&
                            <ul className="tabs-container">
                                <li className="active">
                                    <ul className="member-list">
                                        <li>
                                            <input
                                                type="search"
                                                placeholder="Arkadaş ara..."

                                                onKeyDown={
                                                    (e) => {
                                                        if(e.key == "Enter") {
                                                            e.preventDefault()
                                                            pagination.q = q
                                                            setPagination(pagination)
                                                            setAllUsers(null)
                                                            dispatch(fetchGetAllUsers(pagination))
                                                        }
                                                    }
                                                }
                                                onChange={(e) => setQ(e.target.value)}

                                            />
                                            <i
                                                className="fa-solid fa-sort"
                                                onClick={(): void => {
                                                    pagination.sort = pagination.sort === "asc" ? "desc": "asc"
                                                    setPagination(pagination)
                                                    setAllUsers(null)
                                                    dispatch(fetchGetAllUsers(pagination))
                                                }}
                                            ></i>
                                        </li>
                                        {
                                            (allUsers !== null) &&
                                                <>
                                                    {allUsers.map((item: User) =>
                                                        <li>
                                                            <span>
                                                                <img
                                                                    src={item.picture}
                                                                    alt={item.name}
                                                                    style={{
                                                                        width: '20px',
                                                                        border: '1px solid red',
                                                                        borderRadius: '100px'
                                                                    }}/> {item.name}
                                                            </span>
                                                            {
                                                                me.response?.friends.find((f: Friend) => f.owner.email === item.email || f.person.email === item.email)
                                                                    ? ""
                                                                    : <span className="time" style={{float: 'right'}}><i className="fa-solid fa-user-plus"></i></span>
                                                            }

                                                        </li>
                                                        )
                                                    }
                                                    {getAllUsers.response !== null && getAllUsers.response?.page < getAllUsers.response?.pages &&
                                                        <button
                                                            onClick={(): void => {
                                                                pagination.page = pagination.page + 1
                                                                setPagination(pagination)
                                                                dispatch(fetchGetAllUsers(pagination))
                                                            }}
                                                        >Sonraki sayfa</button>
                                                    }
                                                </>
                                        }
                                    </ul>
                                </li>
                                <li></li>
                                <li></li>
                            </ul>
                        }
                        {selectedTab === 'settings' &&
                            <ul className="tabs-container">
                                settings
                            </ul>
                        }
                    </div>
                </>}
            </div>
            {notification.show && <Notification color={notification.color} message={notification.msg}/>}
        </>
}
export default Home