import { groupByDate } from "@/common/util"
import { Chat } from "@/types/chat"
import { useEffect, useMemo, useState } from "react"
import ChatItem from "./ChatItem"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"
import { useEventBusContext } from "@/components/EventBusContext"
export default function ChatList() {
    const {subscribe, unsubscribe}  = useEventBusContext()
    const [chatList, setChatList] = useState<Chat[]>([
        {
            id: "1",
            title: "test",
            updateTime: Date.now()
        },
        
        {
            id: "2",
            title: "test",
            updateTime: Date.now()
        },
        
    ])
    const {
        state: { selectedChat,user },
        dispatch
    } = useAppContext()

    const groupList = useMemo(() => {
        return groupByDate(chatList)
    }, [chatList])

    useEffect(()=>{
        const callback:EventListener = () =>{
            const temp = chatList.concat({id:"3",title:"hello",updateTime:Date.now()})
            setChatList(temp)
        }
        subscribe("fetchChatList",callback)
        return () => unsubscribe("fetchChatList",callback)

    },[])


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
                                const selected = selectedChat?.id === item.id
                                return (
                                    <ChatItem
                                        key={item.id}
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
