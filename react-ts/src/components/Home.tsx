import React, {useEffect, useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from "../store"
import {IPagination, IState} from "../store/types/global"
import {Friend, UserPaginationDTO, UserResponse} from "../store/types/userResponse"
import Notification from "./Notification"
import EmojiPicker, {EmojiClickData} from "emoji-picker-react"
import {fetchBlockUnblockFriend} from "../store/features/patchBlockUnblockFriendSlice"
import {
    addFriendsInContext,
    deleteFriendsInContext,
    updateFriendsInContext,
    updateOnlineOfflineFriendInContext
} from "../store/features/auth/meSlice"
import {fetchGetAllUsers} from "../store/features/getAllUsersSlice"
import {fetchPutFriend} from "../store/features/putFriendSlice"
import {fetchDeleteFriend} from "../store/features/deleteFriendSlice"
import {fetchGetAllMessages} from "../store/features/getAllMessagesSlice"
import {MessageDTO} from "../store/types/message"
import moment from "moment"
import {makeid} from "../utils"
import app from "../config/app"
import AppStorage from "../utils/storage"
import {IMessageEvent, w3cwebsocket as WebSocket} from 'websocket'
import {WsRequestBody, WsType} from "../store/types/ws"

function Home(): React.JSX.Element {
    const dispatch = useAppDispatch()
    const me: IState<UserResponse> = useAppSelector(state => state.me)
    const patchBlockUnblockFriend: IState<UserResponse> = useAppSelector(state => state.patchBlockUnblockFriend)
    const getAllUsers: IState<UserPaginationDTO> = useAppSelector(state => state.getAllUsers)
    const putFriend: IState<UserResponse> = useAppSelector(state => state.putFriend)
    const deleteFriend: IState<UserResponse> = useAppSelector(state => state.deleteFriend)
    const getAllMessages = useAppSelector(state => state.getAllMessages)
    const [notification, setNotification] = useState({show: false, color: "green", msg: ""})
    const [selectedFriend, setSelectedFriend] = useState<Friend |null>(null)
    const [selectedNewFriend, setSelectedNewFriend] = useState<UserResponse |null>(null)
    const [selectedTab, setSelectedTab] = useState<string>('')
    const [msg, setMsg] = useState<string>('')
    const [showPicker, setShowPicker] = useState<boolean>(false)
    const [allUsers, setAllUsers] = useState<UserResponse[] |null>(null)
    const messagesEndRef = useRef<HTMLLIElement>(null)
    const [wsConnection, setWsConnection] = useState<WebSocket |null>(null)

    useEffect((): void => {
        const ws: WebSocket = new WebSocket(`${app.API_WS}?access_token=${AppStorage.getAccessToken()}`)
        ws.onopen = (): void => {
            setWsConnection(ws)
            setNotification({show: true, color: 'green', msg: `Websocket bağlandı`})
            setTimeout((): void => {
                setNotification({show: false, color: '', msg: ''})
            }, 1_000)
        }
        let msg = {show: true, color: '', msg: ``}
        ws.onmessage = (event: IMessageEvent): void => {
            const parse: WsRequestBody = JSON.parse(event.data.toString())
            if (parse.type === WsType.Online) {
                dispatch(updateOnlineOfflineFriendInContext({data: parse.content, type: 'online', me: me.response?.email}))
            } else  if (parse.type === WsType.Offline) {
                dispatch(updateOnlineOfflineFriendInContext({data: parse.content, type: 'offline', me: me.response?.email}))
            } else  if (parse.type === WsType.PrivateMessage) {
                console.log("PrivateMessage")
            } else if (parse.type === WsType.FriendShipPending) {
                console.log("FriendShipPending")
            } else if (parse.type === WsType.FriendShipAccepted) {
                console.log("FriendShipAccepted")
            } else if (parse.type === WsType.FriendShipBlocked) {
                console.log("FriendShipBlocked")
            } else if (parse.type === WsType.FriendShipUnBlocked) {
                console.log("FriendShipUnBlocked")
            } else if (parse.type === WsType.FriendShipDeleted) {
                console.log("FriendShipDeleted")
            } else {
                msg = {show: true, color: 'red', msg: `Bilinmeyen ws mesajı. ${parse.type}`}
            }

            if (msg.msg !== '') {
                setNotification(msg)
                setTimeout((): void => {
                    setNotification({show: false, color: '', msg: ''})
                }, 1_000)
            }
        }
        ws.onclose = (): void => {
            console.log('WebSocket connection closed')
        }
    }, [])

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
            const userFromFriend: UserResponse = getUserFromFriend(selectedFriend!)
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
    useEffect((): void => {
        if (selectedNewFriend !== null) {
            dispatch(fetchPutFriend(selectedNewFriend!.email))
        }
    }, [selectedNewFriend, dispatch])
    useEffect((): void => {
        if (putFriend.response !== null && !putFriend.isLoading) {
            dispatch(addFriendsInContext({owner: me.response, person: selectedNewFriend}))
            setSelectedNewFriend(null)
            setNotification({show: true, color: 'green', msg: `İstek gönderildi.`})
            setTimeout((): void => {
                setNotification({show: false, color: '', msg: ''})
            }, 3000)
        }
    }, [putFriend, dispatch])
    useEffect((): void => {
        if (deleteFriend.response !== null && !deleteFriend.isLoading && selectedFriend !== null) {
            dispatch(deleteFriendsInContext({email: getUserFromFriend(selectedFriend).email}))
            setNotification({show: true, color: 'green', msg: `İstek Silindi.`})
            setTimeout((): void => {
                setNotification({show: false, color: '', msg: ''})
            }, 3000)
        }
    }, [deleteFriend, dispatch])
    useEffect((): void => {
        if (selectedFriend !== null) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: 'end' })
            dispatch(fetchGetAllMessages({email: getUserFromFriend(selectedFriend).email, params: pagination}))
        }
    }, [selectedFriend])
    const getUserFromFriend = (friend: Friend): UserResponse => friend.owner?.email === me.response?.email ? friend.person : friend.owner
    const extract = (base64Data: string): [string, string] => {
        const [raw, mediaType, rawData]: RegExpMatchArray = base64Data.match(/^data:([^;]+);base64,(.+)$/)!
        return [mediaType, rawData]
    }

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
                                    {friend.isOnline && <i className="fa-solid fa-circle fa-2xs" style={{color: 'green', fontSize: 'xx-small'}}></i>}
                                </li>
                            )
                        }
                    </ul>
                    <div className="my-account" onClick={() => setSelectedTab('settings')}>
                        <div className="image">
                            <img src={me.response?.picture} alt={me.response?.name}/>
                            <i className={`fa fa-circle ${wsConnection !== null ? 'online' : 'offline'}`}></i>
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
                                {
                                    (getAllMessages.response !== null && !getAllMessages.isLoading) &&
                                    getAllMessages.response.items.map((message: MessageDTO) =>
                                        <>
                                            <li className={me.response?.email !== message.from.email ? 'me': ''} ref={messagesEndRef}>
                                                <div className="name">
                                                    <span className="">{message.from.email !== me.response?.email ? message.from.name : ''}</span>
                                                </div>
                                                <div className="message">
                                                    {message.text !== undefined && <p>{message.text}</p>}
                                                    {message.binary !== undefined &&
                                                        <p>
                                                            <span className="blue-label">
                                                                <a href={message.binary} download={makeid(15)} style={{color: 'white', textDecoration: 'none'}}>
                                                                    {extract(message.binary)[0]}
                                                                </a>
                                                            </span>
                                                        </p>
                                                    }
                                                    <span className="msg-time">
                                                        {moment(message.createdAt * 1_000).fromNow()}
                                                        {/*
                                                        <sup> ({(new Date(message.createdAt * 1000)).toLocaleString('tr-TR', {formatMatcher: "basic"})})</sup>
                                                        */}
                                                        {message.readAt === undefined ? <i className="fa-solid fa-check"></i>: <i className="fa-solid fa-check-double"></i>}
                                                    </span>
                                                </div>
                                            </li>
                                        </>
                                    )
                                }
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
                                    <img
                                        src={getUserFromFriend(selectedFriend).picture}
                                        style={{
                                            width: '75px',
                                            borderRadius: '100px',
                                            border: selectedFriend.isOnline ? '2px solid green': '2px solid red'
                                        }}
                                        alt={getUserFromFriend(selectedFriend).name}
                                    />
                                    <h1>{getUserFromFriend(selectedFriend).name}</h1>
                                    <h2>{getUserFromFriend(selectedFriend).email}</h2>
                                </header>
                                <br/>
                                <ul className="member-list">
                                    {
                                        selectedFriend.status === "Accepted"
                                            ? <li><i className="fa-solid fa-user-xmark"></i> Arkadaşlıktan çıkar</li>
                                            : getUserFromFriend(selectedFriend).email === me.response?.email
                                                ? <li><i className="fa-solid fa-user-xmark"></i> İsteği kabul et</li>
                                                : <li
                                                    onClick={(): void => {
                                                        dispatch(fetchDeleteFriend(getUserFromFriend(selectedFriend).email))
                                                    }}>
                                                    <i className="fa-solid fa-user-xmark"></i> İsteği iptal et
                                                </li>
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
                                                    {allUsers.map((item: UserResponse) =>
                                                        <li>
                                                            <span>
                                                                <img src={item.picture} alt={item.name} style={{width: '20px'}}/> {item.name}
                                                            </span>
                                                            {
                                                                me.response?.friends.find((f: Friend) => f.owner.email === item.email || f.person.email === item.email)
                                                                    ? ""
                                                                    : <span className="time" style={{float: 'right'}}>
                                                                        <i
                                                                            className="fa-solid fa-user-plus"
                                                                            onClick={(): void => {setSelectedNewFriend(item)}}
                                                                        ></i>
                                                                    </span>
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