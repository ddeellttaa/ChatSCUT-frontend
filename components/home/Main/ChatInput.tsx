import Button from "@/components/common/Button"
import { MdDeleteForever, MdDriveFileMove, MdRefresh } from "react-icons/md"
import { PiLightningFill, PiStopBold } from "react-icons/pi"
import { FiSend, FiStar } from "react-icons/fi"
import TextareaAutoSize from "react-textarea-autosize"
import { useRef, useState,useEffect, ChangeEvent } from "react"
import { v4 as uuidv4 } from "uuid"
import { Chat, ChatDTO, Message, MessageRequestBody } from "@/types/chat"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"
import { useEventBusContext,EventListener } from "@/components/EventBusContext"
import { sleep } from "@/common/util"
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa"
import { BsFiletypeJava } from "react-icons/bs";

import Card from "./Card"
import Enter from "./ChatScut"
import { describe } from "node:test"
import { start } from "repl"


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
                value:{...selectedChat,chatId:chatIdRef.current}
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

    async function updateChatTitle(messages: Message) {
        const body = JSON.stringify({
            "message":messages.message
        })
        let response = await fetch("http://10.48.8.76:1203/TitleSummary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body
        })
        if (!response.ok) {
            console.log(response.statusText)
            return
        }
        if (!response.body) {
            console.log("body error")
            return
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let done = false
        let title = ""
        while (!done) {
            const result = await reader.read()
            done = result.done
            const chunk = decoder.decode(result.value)
            title += chunk
       
        
        }
        const data = JSON.parse(title)
        const real_title = data.result


        response = await fetch(`http://localhost:8080/chat/${chatIdRef.current}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"description":real_title})
        })
        if (!response.ok) {
            console.log(response.statusText) 
            return
        }
        dispatch({
            type:ActionType.UPDATE,
            field:"selectedChat",
            value:{...selectedChat,description:title}
        })
   
      
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
        if (!selectedChat?.description || selectedChat.description === "新建对话") {
            console.log(messages.length)
            if(messages.length>2){
            updateChatTitle(message)
        }
        }
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
           
            dispatch({
                type: ActionType.UPDATE_MESSAGE,
                message: { ...responseMessage, message:content }
            })
        }
        
        const m: Message = {
            id: uuidv4(),
            role: "assistant",
            message: content,
            chatid:chatIdRef.current,
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

    
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [audioURL, setAudioURL] = useState<string>('');
    const [audioBlob, setAudioBlob] = useState<Blob>()
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      console.log('File selected:', e.target.files[0]);  // Debugging line
    } else {
      console.log('No file selected');  // Debugging line
    }
  };
 


const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
        }
    };

    mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
};

const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
};


const vsend = async ()=>{
    console.log(audioBlob)
    console.log(file)
    if (audioBlob && file){
        const formData = new FormData();
        formData.append('files', audioBlob, 'recording.wav');
        formData.append('files',file);

        console.log(formData)
       
        const response = await fetch('http://10.48.8.76:1202/multimodal', {
        method: 'POST',
        body: formData,
        });

        const responseData = await response.json()

        
        console.log(JSON.stringify(responseData.combined_text))
        if (response.ok) {
        console.log('Audio sent successfully');
        } else {
        console.error('Error sending audio');


}
    }
};


    const [dragOver, setDragOver] = useState(false)

    const handleDrap = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            console.log(e.dataTransfer.files[0])
            setFile(e.dataTransfer.files[0]);
    }

    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false)
    }

    const handleDragover = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true)
    }

    const handleDeletefile = ()=>{
    
        setFile(null)
        console.log(file)
    }

 
    return (
    <>
      {!selectedChat && (
        <div className="flex flex-col items-center p-5 mt-0">
          <div className="flex flex-row mb-5 items-center justify-between mt-0">
            <img src="logo.png" className="h-auto w-24" alt="logo" />
            <span className="text-4xl font-sans ml-3">ChatSCUT</span>
          </div>
          <div className="flex flex-wrap justify-around mt-40">
            {cards.map((card, index) => (
              <Card
                key={index}
                icon={card.icon}
                title={card.title}
                onClick={() => handleOnClick(card.title)}
              />
            ))}
          </div>
        </div>
      )}
      <div
        className="absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(53,55,64,0)] dark:to-[#353740] dark:to-[58.85%]"
        onDragOver={handleDragover}
        onDrop={handleDrap}
        onDragLeave={handleDragLeave}
      >
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4">
          <div className="container flex flex-col">
            <div className="top-row flex items-center">
              {file && (
                <div className="flex items-center space-x-4 mt-4 mb-2 p-2 border rounded-lg bg-gray-50 min-w-[300px]">
                  <BsFiletypeJava className="w-8 h-8 text-gray-500" />
                  <div>
                    <p className="font-bold text-blue-500">{file.name}</p>
                    <p className="text-sm text-gray-500">{'文档'}</p>
                  </div>
                   <div className="flex-grow"></div>
                  <Button
                      icon={MdDeleteForever}
                      variant="primary"
                      onClick={() => {
                        handleDeletefile()
                      }}
                      className="font-medium"
                    ></Button>
                </div>
              )}
              <input id="file" type="file" onChange={handleFileChange} className="hidden" />

              <div className="flex items-center justify-center flex-grow">
                {messageList.length !== 0 &&
                  (streamingId !== "" ? (
                    <Button
                      icon={PiStopBold}
                      variant="primary"
                      onClick={() => {
                        stopRef.current = true;
                      }}
                      className="font-medium"
                    >
                      停止生成
                    </Button>
                  ) : (
                    <Button
                      icon={MdRefresh}
                      variant="primary"
                      onClick={resend}
                      className="font-medium"
                    >
                      重新生成
                    </Button>
                  ))}
              </div>

              <div className="">
                {audioURL && <audio src={audioURL} controls className="ml-auto" />}
              </div>
            </div>
            <div className="bottom-row flex items-end w-full border border-black/10 dark:border-gray-800/50 bg-white dark:bg-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] py-4">
              <div className="mx-3 text-primary-500 ">
                  <label htmlFor="file"
                      className="font-medium btn btn-primary cursor-pointer "
                      
                    >
                        <MdDriveFileMove className="w-10 h-10 transition-colors inline-flex items-center min-w-[38px] min-h-[38px] rounded px-3 py-1.5 bg-primary-500 text-white hover:bg-primary-600 hover:text-white shadow-sm disabled:shadow-none disabled:bg-transparent disabled:text-gray-300 dark:disabled:text-gray-600" />
                    </label>
              </div>
              <TextareaAutoSize
                className="outline-none flex-1 max-h-64 mb-1.5 bg-transparent text-black dark:text-white resize-none border-0"
                placeholder="给”ChatSCUT“发送消息,也可以将文件拖到这里"
                rows={1}
                value={messageText}
                onKeyDown={handleKeyevent}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <Button
                className="mx-3 !rounded-lg"
                icon={FiSend}
                disabled={messageText.trim() === "" || streamingId !== ""}
                variant="primary"
                onClick={vsend}
              />
              {isRecording ? (
                <Button
                  className="mx-3 !rounded-lg"
                  icon={FaRegStopCircle}
                  variant="primary"
                  onClick={stopRecording}
                />
              ) : (
                <Button
                  className="mx-3 !rounded-lg"
                  icon={FaMicrophone}
                  variant="primary"
                  onClick={startRecording}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
