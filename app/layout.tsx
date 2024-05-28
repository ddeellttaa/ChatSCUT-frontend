import AppContextProvider from "@/components/AppContext"
import "@/styles/globals.css"
import "@/styles/markdown.css"
import "@/components/EventBusContext"
import type { Metadata } from "next"
import EventBusContextProvider from "@/components/EventBusContext"
import Head from 'next/head';

export const metadata: Metadata = {
    title: "ChatSCUT",
    description: "ChatSCUT",

}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en'>
        
            <body>
                <AppContextProvider>
                    <EventBusContextProvider>{children}</EventBusContextProvider> 
                </AppContextProvider>
                
            </body>
        </html>
    )
}
