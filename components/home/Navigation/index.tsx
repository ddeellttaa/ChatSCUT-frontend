"use client"

import { useAppContext } from "@/components/AppContext"
import Menubar from "./Menubar"
import Toolbar from "./Toolbar"
import ChatList from "./ChatList"

export default function Navigation() {
    const {
        state: { displayNavigation }
    } = useAppContext()
    return (
        <nav
            className={`${
                displayNavigation ? "" : "hidden"
            } flex flex-col dark relative h-full w-[260px] bg-blue-50 text-gray-900 p-2`}
        >
            <Menubar />
            <ChatList />
            <Toolbar />
        </nav>
    )
}
