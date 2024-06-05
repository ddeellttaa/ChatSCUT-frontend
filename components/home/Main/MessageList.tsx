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
        state: { messageList, streamingId,selectedChat,user },
        dispatch
    } = useAppContext()
    const [ifDone,setifDone] = useState(false)
    async function getData(chatid:string){
        const response = await fetch(`http://localhost:8080/message/${selectedChat?.chatId}`,{
            method:"POST",
            headers:{
                    "Content-Type":"application/json"
                },
        })
        const responseData = await response.json();
        const list = (responseData["data"]) as Message[];
        console.log(list)
        dispatch({
            type:ActionType.UPDATE,
            field:"messageList",
            value:list

        })

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
        console.log(selectedChat?.chatId)
        if(selectedChat){
            getData(selectedChat.chatId)
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
                                    <Markdown>{`${message.message}${
                                        message.id === streamingId ? "▍" : ""
                                    }`}</Markdown>
                                </div>
                                <div>
                                    {!isUser && 
                                    <Button
                                        icon={FaVolumeUp}
                                        onClick={()=>send(message.message)}
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
