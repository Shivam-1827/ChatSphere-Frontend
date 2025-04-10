import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "./RoomContext";
import icon from "./image/icon.png";

function Dashboard() {
    const { roomCode, setRoomCode } = useRoom();
    const divRef = React.useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const wsRef = useRef<WebSocket | null>(null);  
    const navigate = useNavigate();  

    function generateRoomCode() {
        const characters = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&!?";
        let code = Array.from(
            { length: 6 }, 
            () => characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
        
        setRoomCode(code);
        divRef.current?.classList.remove("hidden");
    }

    useEffect(() => {
        const ws = new WebSocket("wss://chatsphere-10y3.onrender.com");
        wsRef.current = ws;
        
        ws.onopen = () => console.log("Connected to server");
        
        return () => {
            if (ws) ws.close();
        };
    }, []);

    const handleJoinRoom = () => {
        const roomId = inputRef.current?.value;
        
        if (roomId && wsRef.current) {
            wsRef.current.send(JSON.stringify({
                type: "join",
                payload: { roomId }
            }));
            
            setRoomCode(roomId);
            
            if (inputRef.current) {
                inputRef.current.value = "";
            }
            
            navigate("/home");
        } else {
            console.error("Invalid room ID or WebSocket not connected");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="max-w-xl w-full p-4 border border-gray-300 bg-black shadow-md rounded-md">
                {/* Header Section */}
                <div className="text-center">
                    <div className="flex flex-row justify-center items-center mb-4">
                        <img src={icon} alt="icon" className="w-12 h-12 brightness-0 invert" />
                        <h1 className="text-lg font-semibold ml-2 text-white">ChatSphere - A Real Time Chat</h1>
                    </div>
                    <p className="text-gray-400 text-md">Temporary room that expires after all users exit</p>
                </div>

                {/* Create Room Button */}
                <button 
                    onClick={generateRoomCode}
                    className="w-full border border-white rounded-md text-white font-semibold px-4 py-2 mt-4 hover:bg-gray-800 transition">
                    Create New Room
                </button>

                {/* Join Room Section */}
                <div className="mt-4 flex items-center space-x-4">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Enter Room Code"
                        className="flex-1 border border-gray-400 rounded-md bg-transparent text-white px-4 py-2 outline-none placeholder-gray-400"
                    />
                    <button 
                        onClick={handleJoinRoom}
                        className="border border-gray-400 rounded-md px-4 py-2 text-white hover:bg-gray-800 transition">
                        Join Room
                    </button>
                </div>

                {/* Share Room Code Section */}
                <div 
                    ref={divRef}
                    className="text-center mt-4 hidden">
                    <h3 className="text-sm text-gray-400">Share this code with your friend</h3>
                    <h2 
                        className="text-2xl font-bold bg-gray-800 text-white px-4 py-2 mt-2 rounded-md">
                        {roomCode}
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
