export interface WsRequestBody {
    from: string
    to?: string
    type: WsType
    content?: string
    date: number
}

export enum WsType {
    Online = 'Online',
    Offline = 'Offline',
    PrivateMessage = 'PrivateMessage',
    FriendShipPending = 'FriendShipPending',
    FriendShipAccepted = 'FriendShipAccepted',
    FriendShipBlocked = 'FriendShipBlocked',
    FriendShipUnBlocked = 'FriendShipUnBlocked',
    FriendShipDeleted = 'FriendShipDeleted'
}
