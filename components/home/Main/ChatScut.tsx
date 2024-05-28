import {motion} from "framer-motion";
import Card from "./Card";
import { Message } from "@/types/chat";
import { useAppContext } from "@/components/AppContext";
import { useEventBusContext } from "@/components/EventBusContext";
import { ActionType } from "@/reducers/AppReducer";
import { useEffect } from "react";
export default function Enter(){
    const {state:{message},dispatch} = useAppContext()
    const {publish} = useEventBusContext()
    const cards = [
    { icon: '📚', title: '微积分上难不难' },
    { icon: '💼', title: '从国际校区到五山的校巴在哪上车'},
    { icon: '🍽️', title: '推荐一道五山的美食' },
    { icon: '✈️', title: '像本地人一样游览大学城校区' }
  ];

    function handleOnclick(m:string){

        publish("card",m)
    }
    useEffect(()=>{
    console.log("messageiswhat",message)
    },[message])
    return(
        <div className="flex flex-col items-center p-5 mt-20 ">
            <div className="flex flex-row mb-5 items-center justify-between mt-40  ">
                <img src="logo.png" className="h-auto w-24"></img>
                <span className="text-4xl font-sans ml-3 ">ChatSCUT</span>
            </div>
            <div className="flex flex-wrap justify-around mt-40">
                {cards.map((card, index) => (
                <Card
                    key={index}
                    icon={card.icon}
                    title={card.title}
                    onClick={()=>{
                        handleOnclick(card.title)
                    }}
                    
                />
                ))}
            </div>
            
        </div>
    )
}