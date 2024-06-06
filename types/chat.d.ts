export interface Chat {
    chatId: string
    description: string
    time:number
   
    
}
export interface ChatDTO {
    chatid: string
    description: string
    time:string 
    user:string
    
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