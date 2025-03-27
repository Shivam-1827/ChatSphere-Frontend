import { useRef, useState, useEffect } from "react";
import Icon from "./image/icon.png";
import { useRoom } from "./RoomContext";

interface Message {
    text: string;
    type: 'sent' | 'received';
}

function Home() {
    const { roomCode } = useRoom();
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState("");
    const [userCount, setUserCount] = useState(1);
    const wsRef = useRef<WebSocket | null>(null);

    // Establish WebSocket connection
    useEffect(() => {
        const ws = new WebSocket("wss://chatsphere-backend-8wxp.onrender.com");

        ws.onopen = () => {
            console.log("Connected to WebSocket server");
            ws.send(JSON.stringify({
                type: "join",
                payload: { roomId: roomCode }
            }));
        };

        ws.onmessage = (event) => {
            try {
                const parsedMessage = JSON.parse(event.data);
                
                // Handle user count update
                if (parsedMessage.type === "userCount") {
                    setUserCount(parsedMessage.payload.count);
                    return;
                }

                // Handle regular chat messages
                setMessages((prev) => [...prev, { 
                    text: parsedMessage.type ? parsedMessage.payload.message : event.data, 
                    type: 'received' 
                }]);
            } catch (error) {
                // If parsing fails, treat it as a regular message
                setMessages((prev) => [...prev, { 
                    text: event.data, 
                    type: 'received' 
                }]);
            }
        };

        wsRef.current = ws;

        return () => {
            if (ws) ws.close();
        };
    }, [roomCode]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send message function
    const handleSendMessage = () => {
        if (message.trim() && wsRef.current) {
            wsRef.current.send(JSON.stringify({
                type: "chat",
                payload: { 
                    roomId: roomCode,
                    message 
                }
            }));

            setMessages((prev) => [...prev, { 
                text: message, 
                type: 'sent' 
            }]);

            setMessage("");
            inputRef.current?.focus();
        }
    };

    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center">
            <div className="w-200 h-180 bg-[#121212] text-white rounded-lg shadow-lg p-4">
                
                {/* Header Section */}
                <div className="text-center">
                    <div className="flex flex-row justify-center items-center mb-4">
                        <img src={Icon} alt="icon" className="w-12 h-12 brightness-0 invert" />
                        <h1 className="text-lg font-semibold ml-2 text-white">ChatSphere - A Real Time Chat</h1>
                    </div>
                    <p className="text-gray-400 text-md">Temporary room that expires after all users exit</p>
                </div>


                {/* Room Info */}
                <div className="bg-gray-800 p-2 rounded-md flex justify-between items-center text-sm">
                    <span>Room Code: <b className="text-blue-400">{roomCode}</b></span>
                    <span>Active Members: {userCount}</span>
                </div>

                {/* Messages Area */}
                <div className="mt-3 p-2 bg-black border border-gray-700 rounded-md h-130 overflow-y-auto">
                    {messages.length === 0 ? (
                        <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                    ) : (
                        <div className="space-y-2">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`flex ${
                                        msg.type === 'sent' 
                                            ? 'justify-end' 
                                            : 'justify-start'
                                    }`}
                                >
                                    <div 
                                        className={`p-2 rounded-md max-w-[80%] ${
                                            msg.type === 'sent' 
                                                ? 'bg-white text-black' 
                                                : 'bg-gray-800 text-white'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="mt-3 flex items-center border-t border-gray-700 pt-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-2"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-white text-black px-4 py-1 rounded-md hover:bg-gray-300 transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;