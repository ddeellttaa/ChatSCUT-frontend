import { useAppContext } from "@/components/AppContext"
import ChatInput from "./ChatInput"
import Menu from "./Menu"
import MessageList from "./MessageList"
import Welcome from "./Welcome"
export default function Main() {
    const{
        state : {selectedChat,themeMode}
    } = useAppContext()
    return (
        <div className={`${themeMode} flex-1 relative`} style={{ backgroundImage: 'url(/final.png)', backgroundSize: 'cover', height: '100vh' }} >
            <main className='overflow-y-auto w-full h-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100'>
                <Menu />
                {/* {!selectedChat && <Enter /> } */}
            
                <MessageList />
                <ChatInput />
            </main>
        </div>
    )
}
