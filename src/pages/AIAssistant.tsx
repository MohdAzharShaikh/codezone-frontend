// src/pages/AIAssistant.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api, { isAxiosError } from '@/api/axios';
import { useAppContext, ChatMessage } from '@/context/AppContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

// --- Icons ---
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>;
const AiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /><path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /><circle cx="12" cy="12" r="2" /></svg>;
const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>;


export default function AIAssistant() {
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { chatHistory, setChatHistory } = useAppContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isLoading]);

    const handleSendMessage = async (messageText?: string) => {
        const message = messageText || inputMessage.trim();
        if (!message || isLoading) return;

        const userMessage: ChatMessage = { text: message, sender: 'user' };
        setChatHistory(prev => [...prev, userMessage]);
        
        setInputMessage("");
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/gemini/chat', [...chatHistory, userMessage]);
            const aiMessage: ChatMessage = { text: response.data, sender: 'ai' };
            setChatHistory(prev => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage = `Sorry, an error occurred. Please try again. ${isAxiosError(err) && err.response ? `(Code: ${err.response.status})` : ''}`;
            setError(errorMessage);
            setChatHistory(prev => [...prev, { text: errorMessage, sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setChatHistory([]);
        setError(null);
    };

    const examplePrompts = [
        "Explain recursion in Python",
        "How to center a div?",
        "Write a function to reverse a string in JavaScript",
    ];

    return (
        <div className="h-full w-full flex flex-col p-4 bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
            {/* Main Chat Card */}
            <motion.div 
                className="h-full w-full bg-white dark:bg-gray-800/50 dark:backdrop-blur-lg rounded-2xl flex flex-col relative border border-slate-200 dark:border-t-purple-600/50 dark:border-x-purple-800/50 dark:border-b-purple-900/50 shadow-2xl dark:shadow-purple-900/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Header */}
                <CardHeader className="flex-row items-center justify-between border-b border-slate-200 dark:border-gray-700 p-4 z-10">
                    <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            AI Assistant
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500 dark:text-gray-400">
                            Your personal coding partner
                        </CardDescription>
                    </div>
                    <Button onClick={handleClearChat} variant="ghost" size="icon" className="text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white rounded-full">
                        <ClearIcon />
                    </Button>
                </CardHeader>
                
                {/* Chat Content */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.length === 0 && !isLoading ? (
                        <motion.div 
                            className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-gray-400"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 shadow-lg mb-4">
                                <AiIcon />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Hello! How can I help?</h2>
                            <p className="mt-2 mb-6 max-w-sm">Ask me anything about code, or try one of the examples below.</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {examplePrompts.map(prompt => (
                                    <Button key={prompt} variant="outline" className="dark:bg-gray-700/50 dark:hover:bg-gray-700 dark:border-gray-600" onClick={() => handleSendMessage(prompt)}>
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {chatHistory.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className={clsx("flex items-end gap-3 w-full", msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                                >
                                    {/* AI Avatar */}
                                    {msg.sender === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-700 text-white p-1.5 shadow-md flex-shrink-0">
                                        <AiIcon />
                                    </div>
                                    )}
                                    {/* Message Bubble */}
                                    <div className={clsx(
                                    "prose dark:prose-invert prose-sm max-w-xl text-left p-3 px-4 rounded-2xl",
                                    msg.sender === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                                        : 'bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-gray-200 rounded-bl-none shadow'
                                    )}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                pre: ({ node, ...props }) => <pre className="bg-slate-900/80 text-white p-3 rounded-lg overflow-x-auto text-xs" {...props} />,
                                                code: ({ node, ...props }) => <code className="bg-blue-200/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc list-inside" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside" {...props} />,
                                                p: ({node, ...props}) => <p className="text-inherit" {...props} />
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                    {/* User Avatar */}
                                    {msg.sender === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 p-1 shadow-md flex-shrink-0">
                                        <UserIcon />
                                    </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                    
                    {/* AI "Typing" Indicator */}
                    {isLoading && chatHistory.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-end gap-3 justify-start"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-700 text-white p-1.5 shadow-md flex-shrink-0"><AiIcon /></div>
                            <div className="p-4 rounded-2xl rounded-bl-none bg-slate-200 dark:bg-gray-700 shadow">
                                <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/30">
                    {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
                    <div className="relative">
                        <textarea
                        className="w-full min-h-[50px] max-h-[150px] p-3 pl-4 pr-14 border border-slate-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-gray-200 bg-white dark:bg-gray-700 shadow-inner resize-y transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                        placeholder="Ask the AI Assistant..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={isLoading}
                        />
                        <Button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputMessage}
                        size="icon"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-gray-600 rounded-lg h-9 w-9 text-white transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                        <SendIcon />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
