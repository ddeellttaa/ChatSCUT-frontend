import { useAppContext } from "@/components/AppContext"
import Button from "@/components/common/Button"
import Markdown from "@/components/common/Markdown"
import { ActionType } from "@/reducers/AppReducer"
import { Message } from "@/types/chat"
import { get } from "http"
import { useEffect, useState } from "react"
import { SiOpenai } from "react-icons/si"
import { FaVolumeUp } from "react-icons/fa"
import "/styles/icon.css"
export default function MessageList() {
    const {
        state: { messageList, streamingId,selectedChat },
        dispatch
    } = useAppContext()
    const [ifDone,setifDone] = useState(false)
    async function getData(chatid:string){
        if (chatid === "1"){
            const list : Message[] = [
                {
                    id:"1",
                    role:"user",
                    content:"this is if",
                    chatid:chatid
                },

                {
                    id:"2",
                    role:"assistant",
                    content:"hellomyfriend",
                    chatid:chatid
                }
            ]
            dispatch({
                type:ActionType.UPDATE,
                field:"messageList",
                value: list
            })
            console.log("Updated message list:", list);

        }
        else if(chatid === "2"){
                const list : Message[] = [
                {
                    id:"1",
                    role:"user",
                    content:"this is else",
                    chatid:chatid
                },

                {
                    id:"2",
                    role:"assistant",
                    content:"hellomyfriend",
                    chatid:chatid
                }
            ]
            dispatch({
                type:ActionType.UPDATE,
                field:"messageList",
                value: list
            })
            console.log("Updated message list:", list);

        }
        else{
            const list:Message[] =[]
            dispatch({
                type:ActionType.UPDATE,
                field:"messageList",
                value: list

            })
            console.log("Updated message list:", list);

        }

    }

    async function send(message:string){
        console.log(message)
        const body = JSON.stringify({
            "message":message
        })
        const controller = new AbortController()
        const response = await fetch("http://10.40.20.37:3050", {
            method:"POST",
            headers:{
                "Content-Type" : "application/json"
            },
            signal:controller.signal,
            body:body
        })
        if (response.ok){
            console.log("ok")
            return
        }

        
    }

    useEffect(()=>{
        console.log(selectedChat?.id)
        if(selectedChat){
            getData(selectedChat.id)
        }
        else{
            dispatch({
                type:ActionType.UPDATE,
                field:"messageList",
                value:[]
            })
        }
    },[selectedChat])
    return (
        <div className='w-full pt-10 pb-48 dark:text-gray-300'>
            <ul>
                {messageList.map((message) => {
                    const isUser = message.role === "user"
                    return (
                        <li
                            key={message.id}
                            className={`${
                                isUser
                                    ? "bg-white dark:bg-gray-800"
                                    : "bg-gray-50 dark:bg-gray-800"
                            }`}
                        >
                            <div className='w-full max-w-4xl mx-auto flex space-x-6 px-4 py-6 text-lg'>
                                <div className='text-3xl leading-[1]'>
                                    {isUser ? "😊" : <div className="my-icon"/>}
                                </div>
                                <div className='flex-1'>
                                    <Markdown>{`${message.content}${
                                        message.id === streamingId ? "▍" : ""
                                    }`}</Markdown>
                                </div>
                                <div>
                                    {!isUser && 
                                    <Button
                                        icon={FaVolumeUp}
                                        onClick={()=>send(message.content)}
                                    >
                                     
                                    </Button>}
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
