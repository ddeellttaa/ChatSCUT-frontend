import { Chat,Message } from "@/types/chat"

export type State = {
    user:string
    displayNavigation: boolean
    themeMode: "dark" | "light"
    currentModel: string
    messageList: Message[]
    streamingId: string
    selectedChat?:Chat
    message:string
}

export enum ActionType {
    UPDATE = "UPDATE",
    ADD_MESSAGE = "ADD_MESSAGE",
    UPDATE_MESSAGE = "UPDATE_MESSAGE",
    REMOVE_MESSAGE = "REMOVE_MESSAGE",
    CHANGE_CARD = "CHANGE_CARD",
    Login = "Login"
}

type MessageAction = {
    type: ActionType.ADD_MESSAGE | ActionType.UPDATE_MESSAGE | ActionType.REMOVE_MESSAGE
    message: Message
}

type UpdateAction = {
    type: ActionType.UPDATE
    field: string
    value: any
}

type CardAction = {
    type:ActionType.CHANGE_CARD
    value:string
}

type LoginAction = {
    type:ActionType.Login
    value:string
}

export type Action = UpdateAction | MessageAction | CardAction | LoginAction

export const initState: State = {
    user:"",
    displayNavigation: true,
    themeMode: "light",
    currentModel: "gpt-3.5-turbo",
    messageList: [],
    streamingId: "",
    message:""
}

export function reducer(state: State, action: Action) {
    switch (action.type) {
        case ActionType.UPDATE:
            return { ...state, [action.field]: action.value }
        case ActionType.ADD_MESSAGE: {
            const messageList = state.messageList.concat([action.message])
            return { ...state, messageList }
        }
        case ActionType.UPDATE_MESSAGE: {
            const messageList = state.messageList.map((message) => {
                if (message.id === action.message.id) {
                    return action.message
                }
                return message
            })
            return { ...state, messageList }
        }
        case ActionType.REMOVE_MESSAGE: {
            const messageList = state.messageList.filter((message) => {
                return message.id !== action.message.id
            })
            return { ...state, messageList }
        }
        case ActionType.CHANGE_CARD:{
            const m = action.value
            console.log(m)
            return {...state, m}
        }
        case ActionType.Login:{
            const id = action.value
            return {...state,user:id}
        }
        default: throw new Error()
    }
}