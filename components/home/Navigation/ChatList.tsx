import { groupByDate } from "@/common/util"
import { Chat } from "@/types/chat"
import { useEffect, useMemo, useState } from "react"
import ChatItem from "./ChatItem"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"
import { useEventBusContext } from "@/components/EventBusContext"
import { METHODS } from "http"
export default function ChatList() {
    const {subscribe, unsubscribe}  = useEventBusContext()
    const [chatList, setChatList] = useState<Chat[]>([])
    const {
        state: { selectedChat,user },
        dispatch
    } = useAppContext()

    const groupList = useMemo(() => {
        return groupByDate(chatList)
    }, [chatList])

    useEffect(()=>{
        const callback:EventListener = () =>{
            
            const temp = chatList.concat({chatId:"3",description:"hello",time:Date.now()})
            setChatList(temp)
            console.log(chatList)
        }
        subscribe("fetchChatList",callback)
        return () => unsubscribe("fetchChatList",callback)

    },[])

    useEffect(()=>{
        getChatlist();
        console.log(chatList)

    },[user])

    async function getChatlist(){
        if(user=="") return
        const response = await fetch(`http://localhost:8080/chat/${user}`,{
            method:"POST",
            headers:{
                    "Content-Type":"application/json"
                },
        }
        )
        const responseData = await response.json();
        const list = (responseData["data"]) as Chat[];
        console.log(list)
        setChatList(list)
    
        
    }

    return (
        <div className='flex-1 mb-[48px] mt-2 flex flex-col overflow-y-auto'>
            {groupList.map(([date, list]) => {
                return (
                    <div key={date}>
                        <div className='sticky top-0 z-10 p-3 text-sm bg-gray-50 text-gray-500'>
                            {date}
                        </div>
                        <ul>
                            {list.map((item) => {
                                const selected = selectedChat?.chatId === item.chatId
                                return (
                                    <ChatItem
                                        key={item.chatId}
                                        item={item}
                                        selected={selected}
                                        onSelected={(chat) => {
                                            dispatch({
                                                type:ActionType.UPDATE,
                                                field:"selectedChat",
                                                value:chat
                                            })
                                        }}
                                    />
                                )
                            })}
                        </ul>
                    </div>
                )
            })}
        </div>
    )
}
