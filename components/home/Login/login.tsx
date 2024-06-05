import { useAppContext } from '@/components/AppContext';
import { ActionType } from '@/reducers/AppReducer';
import React, { useState, FormEvent } from 'react';

interface LoginOverlayProps {
  onLogin: () => void;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {state:{user},dispatch} = useAppContext()

    async function check(){
        const body = JSON.stringify({
            "id":username,
            "password":password,
        })
        const response = await fetch("http://localhost:8080/login",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:body,
            }
        )
        const responseData = await response.json();
        if (responseData.success){
            onLogin();
            dispatch({type:ActionType.Login,value:username})
            }
        else{
            alert("Login failed")
        }

    }

    async function regist(){
        const body = JSON.stringify({
            "id":username,
            "password":password,
        })
        const response = await fetch("http://localhost:8080/user",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:body,
            }
        )
        const responseData = await response.json();
        if (responseData.success){
            onLogin();
            dispatch({type:ActionType.Login,value:username})
            }
        else{
            alert("regist failed")
        }

    }


    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        
        await check()
    };

    const handleRegist = async (e: FormEvent) => {
        e.preventDefault();
        
        await regist()
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <form className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl mb-4">Login</h2>
            <div className="mb-4">
            <label className="block text-gray-700">学号:</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded"
            />
            </div>
            <div className="mb-4">
            <label className="block text-gray-700">密码:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
            />
            </div>
            <button onClick={handleLogin} className="w-1/2 bg-blue-500 text-white py-2 rounded">
            登陆
            </button>
            <button onClick={handleRegist} className="w-1/2 bg-red-500 text-white py-2 rounded">
            注册
            </button>
        </form>
        </div>
    );
};

export default LoginOverlay;
