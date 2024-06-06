import Button from "@/components/common/Button"
import { MdRefresh } from "react-icons/md"
import { PiLightningFill, PiStopBold } from "react-icons/pi"
import { FiSend, FiStar } from "react-icons/fi"
import TextareaAutoSize from "react-textarea-autosize"
import { useRef, useState,useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Chat, ChatDTO, Message, MessageRequestBody } from "@/types/chat"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"
import { useEventBusContext,EventListener } from "@/components/EventBusContext"
import { sleep } from "@/common/util"
import { FaMicrophone } from "react-icons/fa"
import Card from "./Card"
import Enter from "./ChatScut"


export default function ChatInput() {

    const [messageText, setMessageText] = useState("")

    const stopRef = useRef(false)

    const chatIdRef = useRef("")

    const {publish,subscribe,unsubscribe} = useEventBusContext()
    
    const cards = [
    { icon: '📚', title: '给我一些微积分学习资料' },
    { icon: '💼', title: '从国际校区到五山的校巴在哪上车'},
    { icon: '🍽️', title: '推荐一道五山的美食' },
    { icon: '✈️', title: '像本地人一样游览大学城校区' }
  ];
    
      

    const {
        state: { messageList, currentModel, streamingId,selectedChat,message,user},
        dispatch
    } = useAppContext()

    const messageRef = useRef(message)

    const getCurrentTimeInUTC8 = () => {
        const date = new Date();
        const utc8Date = new Date(date.getTime() + (8 * 60 * 60 * 1000)); // 加上8小时
        return utc8Date.toISOString().replace('Z', '');
        };

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

    const handleOnClick = async (m:string)=>{
        await send(m)
    }
  

    useEffect(() => {
        const callback:EventListener = async (data) =>{
            await send(data)
        }
        subscribe("card",callback)
        return () => unsubscribe("card",callback)

    },[])

    useEffect(() =>{
        if (chatIdRef.current === selectedChat?.chatId){
            console.log("useeffect")
            return
        }
        else{
            chatIdRef.current = selectedChat?.chatId ?? ""
            // stopRef.current = true
            console.log(chatIdRef)
        }

    },[selectedChat])

    async function changeToNewChat(){
        if(!chatIdRef.current){
            chatIdRef.current = uuidv4() 
            const chat: ChatDTO={
                chatid:chatIdRef.current,
                description:"新建对话",
                time:getCurrentTimeInUTC8(),
                user:user
            }
    
            await sendChat2sql(chat);
            console.log("changetonewchat")
            dispatch({
                type:ActionType.UPDATE,
                field:"selectedChat",
                value:{chatId:chatIdRef.current}
            })

            

        }
    }

    async function sendChat2sql(chat:ChatDTO){
        const body = JSON.stringify(chat)
        console.log(body)
        const response = await fetch("http://localhost:8080/chat",{
            method:"POST",
            headers:{
                    "Content-Type":"application/json"
                },
            body:body,
        })
        const responseData =await response.json()
        if(responseData.success){
            console.log(2222)
            return
        }
    }

    async function send2sql(mes:Message){
        mes.chatid = chatIdRef.current
        const body = JSON.stringify(mes)
        const response = await fetch("http://localhost:8080/message",{
            method:"POST",
            headers:{
                    "Content-Type":"application/json"
                },
            body:body,
        })
        const responseData =await response.json()
        if(responseData.success){
            console.log(11111111)
            return
        }
    }

    async function send(content:string) {
        await changeToNewChat()
        const message: Message = {
            id: uuidv4(),
            role: "user",
            message: content,
            chatid:chatIdRef.current,
            time:getCurrentTimeInUTC8()
        }
        await send2sql(message)
        dispatch({ type: ActionType.ADD_MESSAGE, message })
        const messages = messageList.concat([message])
        await doSend(messages)
  
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
            messages[messages.length - 1].message
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
            message: "",
            chatid:chatIdRef.current,
            time:getCurrentTimeInUTC8()
        }
        dispatch({ type: ActionType.ADD_MESSAGE, message: responseMessage })
        dispatch({
            type: ActionType.UPDATE,
            field: "streamingId",
            value: responseMessage.id
        })
        const reader = response.body.getReader()
        setMessageText("")
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
                message: { ...responseMessage, message:content }
            })
        }
        
        const m: Message = {
            id: uuidv4(),
            role: "assistant",
            message: content,
            chatid:"1",
            time:getCurrentTimeInUTC8()
        }
        console.log(chatIdRef.current)
        await send2sql(m)

        dispatch({
            type: ActionType.UPDATE,
            field: "streamingId",
            value: ""
        })
        
    }

    

    return (
        <>
        {!selectedChat &&  <div className="flex flex-col items-center p-5 mt-0 ">
            <div className="flex flex-row mb-5 items-center justify-between mt-0  ">
                <img src="logo.png" className="h-auto w-24"></img>
                <span className="text-4xl font-sans ml-3 ">ChatSCUT</span>
            </div>
            <div className="flex flex-wrap justify-around mt-40">
                {cards.map((card, index) => (
                <Card
                    key={index}
                    icon={card.icon}
                    title={card.title}
                    onClick={()=>{
                        handleOnClick(card.title)
                    }}
                    
                />
                ))}
            </div>
            
        </div>}
        <div className='absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(53,55,64,0)] dark:to-[#353740] dark:to-[58.85%]'>
                <div className='w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4'>
                    {messageList.length !== 0 &&
                        (streamingId !== "" ? (
                            <Button
                                icon={PiStopBold}
                                variant='primary'
                                onClick={() => {
                                    stopRef.current = true
                                } }
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
                                } }
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
                            } } />
                        <Button
                            className='mx-3 !rounded-lg'
                            icon={FiSend}
                            disabled={messageText.trim() === "" || streamingId !== ""}
                            variant='primary'
                            onClick={() => send(messageText)} />
                        <Button
                            className='mx-3 !rounded-lg'
                            icon={FaMicrophone}
                            variant='primary' />
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
            </div></>
    )
}
