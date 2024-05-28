import {motion} from "framer-motion";

interface CardProps{
    icon:string;
    title:string;
    onClick: any
}

const Card : React.FC<CardProps> = ({icon,title,onClick}) =>{
    return (
        <motion.div className="border border-gray-300 rounded-lg p-5 text-center shadow-md m-2 w-64"
            whileHover={{ scale: [null, 1.2, 1.1] }}
            transition={{ duration: 0.3 }}
            onClick={onClick}>
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-lg font-bold mb-2">{title}</div>
        </motion.div>
    )
}

export default Card;