export interface Chat {
    chatId: string
    description: string
    time: number
   
    
}

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    chatid:string
}

export interface MessageRequestBody {
    messages: Message[]
    model: string
}