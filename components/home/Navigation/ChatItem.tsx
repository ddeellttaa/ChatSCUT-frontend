import { useAppContext } from "@/components/AppContext"
import { Chat } from "@/types/chat"
import { useEffect, useState } from "react"
import { AiFillWeiboSquare, AiOutlineEdit } from "react-icons/ai"
import { MdCheck, MdClose, MdDeleteOutline } from "react-icons/md"
import { PiChatBold, PiTrashBold } from "react-icons/pi"

type Props = {
    item: Chat
    selected: boolean
    onSelected: (chat: Chat) => void
}

export default function ChatItem({ item, selected, onSelected }: Props) {
    const [editing, setEditing] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const {state:{user},dispatch} = useAppContext()

    async function getChatlist(){
        const response = await fetch("http://localhost:8080/chat/{user}",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
            }
        )

    }

    

    useEffect(() => {
        setEditing(false)
        setDeleting(false)
    }, [selected])
    return (
        <li
            onClick={() => {
                onSelected(item)
            }}
            className={`relative group flex items-center p-3 space-x-3 cursor-pointer rounded-md hover:bg-gray-300 ${
                selected ? "bg-gray-300 pr-[3.5em]" : ""
            }`}
        >
            <div>{deleting ? <PiTrashBold /> : <PiChatBold />}</div>
            {editing ? (
                <input
                    autoFocus={true}
                    className='flex-1 min-w-0 bg-transparent outline-none'
                    defaultValue={item.description}
                />
            ) : (
                <div className='relative flex-1 whitespace-nowrap overflow-hidden'>
                    {item.description}
                  
                </div>
            )}

            {selected && (
                <div className='absolute right-1 flex'>
                    {editing || deleting ? (
                        <>
                            <button
                                onClick={(e) => {
                                    if (deleting) {
                                        console.log("deleted")
                                    } else {
                                        console.log("edited")
                                    }
                                    setDeleting(false)
                                    setEditing(false)
                                    e.stopPropagation()
                                }}
                                className='p-1 hover:text-white'
                            >
                                <MdCheck />
                            </button>
                            <button
                                onClick={(e) => {
                                    setDeleting(false)
                                    setEditing(false)
                                    e.stopPropagation()
                                }}
                                className='p-1 hover:text-white'
                            >
                                <MdClose />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={(e) => {
                                    setEditing(true)
                                    e.stopPropagation()
                                }}
                                className='p-1 hover:text-white'
                            >
                                <AiOutlineEdit />
                            </button>
                            <button
                                onClick={(e) => {
                                    setDeleting(true)
                                    e.stopPropagation()
                                }}
                                className='p-1 hover:text-white'
                            >
                                <MdDeleteOutline />
                            </button>
                        </>
                    )}
                </div>
            )}
        </li>
    )
}
