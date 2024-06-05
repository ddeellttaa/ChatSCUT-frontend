export interface Chat {
    chatId: string
    description: string
    time: number
   
    
}

export interface Message {
    id: string
    role: "user" | "assistant"
    message: string
    chatid:string
    time: string
}

export interface MessageRequestBody {
    messages: Message[]
    model: string
}