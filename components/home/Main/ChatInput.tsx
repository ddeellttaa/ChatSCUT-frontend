import Button from "@/components/common/Button"
import { MdRefresh } from "react-icons/md"
import { PiLightningFill, PiStopBold } from "react-icons/pi"
import { FiSend } from "react-icons/fi"
import TextareaAutoSize from "react-textarea-autosize"
import { useRef, useState,useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Message, MessageRequestBody } from "@/types/chat"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"
import { useEventBusContext,EventListener } from "@/components/EventBusContext"
import { sleep } from "@/common/util"


export default function ChatInput() {
    const [messageText, setMessageText] = useState("")
    const stopRef = useRef(false)
    const chatIdRef = useRef("")
    const {publish,subscribe,unsubscribe} = useEventBusContext()
    const {
        state: { messageList, currentModel, streamingId,selectedChat,message},
        
        dispatch
    } = useAppContext()
    const messageRef = useRef(message)
    const handleKeyevent = (event: {
        shiftKey: boolean, key: string 
    }) =>{
        console.log(event.key)
        if(event.key === 'Enter' && event.shiftKey){
        }
        else if(event.key === "Enter"){
            send(messageText)
        }
    }
  

    useEffect(() => {
        const callback:EventListener = (data) =>{
            send(data)
        }
        subscribe("card",callback)
        return () => unsubscribe("card",callback)

    },[])

    useEffect(() =>{
        if (chatIdRef.current === selectedChat?.id){
            console.log("useeffect")
            return
        }
        else{
            chatIdRef.current = selectedChat?.id ?? ""
            // stopRef.current = true
            console.log(chatIdRef)
        }

    },[selectedChat])

    async function changeToNewChat(){
        if(!chatIdRef.current){
            chatIdRef.current = "3"
            publish("fetchChatList")
            dispatch({
                type:ActionType.UPDATE,
                field:"selectedChat",
                value:{id:chatIdRef}
            })


        }
    }
    async function send(content:string) {
        await changeToNewChat()
        const message: Message = {
            id: uuidv4(),
            role: "user",
            content: content,
            chatid:chatIdRef.current
        }
        dispatch({ type: ActionType.ADD_MESSAGE, message })
        console.log(messageList)
        const messages = messageList.concat([message])
        console.log(message)
        doSend(messages)
        console.log(messageList)
    }

    async function resend() {
        const messages = [...messageList]
        if (
            messages.length !== 0 &&
            messages[messages.length - 1].role === "assistant"
        ) {
            dispatch({
                type: ActionType.REMOVE_MESSAGE,
                message: messages[messages.length - 1]
            })
            messages.splice(messages.length - 1, 1)
        }
        doSend(messages)
    }

    async function doSend(messages: Message[]) {
        //const body: MessageRequestBody = { messages, model: currentModel }
        const body = JSON.stringify({
            "message":
            messages[messages.length - 1].content
        });
        
        setMessageText("")
        const controller = new AbortController()
        const response = await fetch("http://10.48.8.76:1203", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            signal: controller.signal,
            body: body,
        })
        console.log(body)
        if (!response.ok) {
            console.log(response.statusText)
            return
        }
        if (!response.body) {
            console.log("body error")
            return
        }
        const responseMessage: Message = {
            id: uuidv4(),
            role: "assistant",
            content: "",
            chatid:chatIdRef.current
        }
        dispatch({ type: ActionType.ADD_MESSAGE, message: responseMessage })
        dispatch({
            type: ActionType.UPDATE,
            field: "streamingId",
            value: responseMessage.id
        })
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let content = ""
        while (!done) {
            if (stopRef.current) {
                stopRef.current = false
                controller.abort()
                break
            }
            const result = await reader.read()
            done = result.done
            const chunk = decoder.decode(result.value)
            content += chunk
            console.log(chunk)
            dispatch({
                type: ActionType.UPDATE_MESSAGE,
                message: { ...responseMessage, content }
            })
        }
        // console.log(messageList[messageList.length-1].content)
        dispatch({
            type: ActionType.UPDATE,
            field: "streamingId",
            value: ""
        })
        setMessageText("")
        
    }

    return (
        <div className='absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(53,55,64,0)] dark:to-[#353740] dark:to-[58.85%]'>
            <div className='w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4'>
                {messageList.length !== 0 &&
                    (streamingId !== "" ? (
                        <Button
                            icon={PiStopBold}
                            variant='primary'
                            onClick={() => {
                                stopRef.current = true
                            }}
                            className='font-medium'
                        >
                            停止生成
                        </Button>
                    ) : (
                        <Button
                            icon={MdRefresh}
                            variant='primary'
                            onClick={() => {
                                resend()
                            }}
                            className='font-medium'
                        >
                            重新生成
                        </Button>
                    ))}
                <div className='flex items-end w-full border border-black/10 dark:border-gray-800/50 bg-white dark:bg-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] py-4'>
                    <div className='mx-3 mb-2.5 text-primary-500'>
                        <PiLightningFill />
                    </div>
                    <TextareaAutoSize
                        className='outline-none flex-1 max-h-64 mb-1.5 bg-transparent text-black dark:text-white resize-none border-0'
                        placeholder='给”ChatSCUT“发送消息'
                        rows={1}
                        value={messageText}
                        onKeyDown={handleKeyevent}
                        onChange={(e) => {
                            setMessageText(e.target.value)
                        }}
                    />
                    <Button
                        className='mx-3 !rounded-lg'
                        icon={FiSend}
                        disabled={
                            messageText.trim() === "" || streamingId !== ""
                        }
                        variant='primary'
                        onClick={()=>send(messageText)}
                    />
                </div>
                {/* <footer className='text-center text-sm text-gray-700 dark:text-gray-300 px-4 pb-6'>
                    ©️{new Date().getFullYear()}&nbsp;{" "}
                    <a
                        className='font-medium py-[1px] border-b border-dotted border-black/60 hover:border-black/0 dark:border-gray-200 dark:hover:border-gray-200/0 animated-underline'
                        href='https://x.zhixing.co'
                        target='_blank'
                    >
                        知行小课
                    </a>
                    .&nbsp;基于第三方提供的接口
                </footer> */}
            </div>
        </div>
    )
}
